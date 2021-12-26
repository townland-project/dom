import { ComponentConfig } from "..";

let count = 0;

// default component methods
const _component_methods: string[] = ['_component_config', '_component_id', '_component_root', '_component_changed']

// dom change detection
const observer = new MutationObserver(OnChangeDetected);

const components: ComponentMap = {}

type Target = new (...args: any[]) => any;

type Module = Target
type Component = Target
interface KeyValue {
    [key: string]: any
}

interface ComponentOptions {
    Values?: KeyValue
    Styles?: KeyValue
    Classes?: string | string[]
    Attributes?: KeyValue
}

interface ComponentMap {
    [id: string]: Component
}

export async function RenderModule(Module: Module): Promise<HTMLElement | undefined> {
    const module = new Module()

    if (!module._module_config.Bootstrap) {
        console.error(`Module doesn't have Bootstrap.`)
        return undefined
    }

    return await RenderComponent(module._module_config.Bootstrap)
}

export async function RenderComponent(Component: Component | string, Options?: ComponentOptions): Promise<HTMLElement> {
    // create new instance of component
    const component = typeof Component == 'string' ? components[Component] : new Component()
    // if component was not exist
    if (component == undefined) {
        console.error(`You don't have '${Component}' component.`)
        return Promise.reject()
    }
    // read component config
    const config: ComponentConfig = component._component_config
    // fetch html url
    if (config.templateUrl) {
        try {
            const res = await fetch(config.templateUrl)
            config.template = await res.text()
        } catch (error) {
            console.error(`Cannot fetch '${config.id}/${config.templateUrl}'`)
            return Promise.reject()
        }
    }

    try {
        // check custom element defined
        if (customElements.get(config.id) == undefined) {
            // create custom element 
            class CustomELement extends HTMLElement {
                private component: any;
                private prototype: any;

                constructor() {
                    super()
                    this.component = typeof Component == 'string' ? components[Component] : new Component();
                    // delete useless config
                    delete (this.component as any)._component_config
                    // set empty component attr
                    this.component._component_attr = {}
                    // set component id
                    count++
                    this.component._component_id = `CUID-${count}`
                    // copy render values to component
                    Object.assign(this.component, Options?.Values || {})
                    // get all methods of class
                    this.prototype = Object.getPrototypeOf(this.component)
                    // if component on init method exist
                    if (this.prototype.ComponentOnInit) this.prototype.ComponentOnInit.bind(component).call()
                }

                connectedCallback() {
                    // append renderred component
                    const range = document.createRange()
                    // render component
                    const dom: HTMLElement = RenderComponentTemplate(config.template!, this.component)

                    range.selectNodeContents(dom)
                    const content = range.extractContents()

                    content.childNodes.forEach(node => this.appendChild(node));
                    // set init value
                    [].slice
                        .apply(this.attributes)
                        .forEach((item: AttrItem) => {
                            if (item.name.includes('bind-init-')) {
                                const key = item.name.replace('bind-init-', '')
                                this!.querySelector(`[bind-value="${key}"]`)!.innerHTML = item.value
                                Object.assign(this.component._component_attr, { [key]: item.value })
                            }
                        });
                    // add element id attr
                    this.setAttribute(this.component._component_id, '')
                    // set component root
                    this.component._component_root = this
                    // component class data changed detection
                    this.component._component_changed = () => {
                        for (const key of Object.keys(this.component)) {
                            if (!_component_methods.includes(key)) {
                                this.querySelectorAll(`[bind-value="${key}"]`).forEach(item => item.innerHTML = this.component[key])
                            }
                        }
                    }
                    // run on render init                
                    if (this.prototype.RenderOnInit) this.prototype.RenderOnInit.bind(this.component).call()
                    // add element to change detector
                    observer.observe(this, { attributes: true, childList: true, subtree: true })
                }

                disconnectedCallback() {
                    // if render on destroy method exist
                    if (this.prototype.RenderOnDestroy) this.prototype.RenderOnDestroy.bind(this.component).call()
                }
            }
            // define new html tag once
            customElements.define(config.id, CustomELement)
            // fetch style url
            if (config.styleUrl) {
                try {
                    const res = await fetch(config.styleUrl)
                    config.style = await res.text()
                } catch (error) {
                    console.error(`Cannot fetch '${config.id}/${config.styleUrl}'`)
                    return Promise.reject()
                }
            }
            // create component style
            if (config.style) {
                const style = document.createElement('style')
                style.appendChild(document.createTextNode(config.style))
                style.setAttribute('type', 'text/css')
                style.setAttribute('component-id', config.id)
                document.head.appendChild(style)
            }
        }
    } catch (error) {
        console.error(error)
    }
    // add component to map
    if (typeof Component != 'string') components[config.id] = component
    // create element
    const element = document.createElement(config.id)

    // create empty attr object
    if (!config.attr) config.attr = {}
    // copy attrs from options
    if (Options?.Attributes) Object.assign(config.attr, Options.Attributes)
    // copy classes from options
    if (Options?.Classes) {
        let classes: string[] = typeof Options.Classes == 'string' ? Options.Classes.split(' ') : Options.Classes
        if (config.attr['class']) classes = config.attr['class'].split(' ')
        Object.assign(config.attr, { 'class': [...new Set(classes)].join(' ') })
    }
    // add style attr                    
    if (Options?.Styles) {
        const styles = Object.keys(Options.Styles).map((key) => `${key}: ${Options.Styles![key]}`).join(';')
        Object.assign(config.attr, { 'style': styles })
    }

    // set bind init from value options
    // if (Options?.Values) {
    //     for (const key of Object.keys(Options.Values)) {
    //         Object.assign(config.attr, { [`bind-init-${key}`]: Options.Values[key] })
    //     }
    // }

    // add attrs
    for (const key of Object.keys(config.attr || [])) {
        element.setAttribute(key, config.attr![key])
    }

    return element
}

function RenderComponentTemplate(template: string, context: any): HTMLElement {
    // {{ DATA }} replace
    template = template.replace(/{{(.*?)}}/g, (match: string) => GetValueOf(match.split(/{{|}}/).filter(Boolean)[0], context) || '')
    // convert string template to dom
    const dom = new DOMParser().parseFromString(template, 'text/html')

    return WalkInDom(dom.body, context)
}

function GetValueOf(key: string, context: any): any {
    const keys = key.split('.')
    if (keys.length > 1) {
        return GetValueOf(keys.slice(1).join('.'), context[keys[0]])
    } else {
        return context[key]
    }
}

function WalkInDom(element: HTMLElement, context: any): HTMLElement {
    element.querySelectorAll('[bind-click]').forEach((elem) => {
        const method = elem.getAttribute('bind-click')!
        const method_name = method.split('(')[0]
        if (method_name in context) {
            const values: any[] = method.split('(')[1].split(')')[0].split(',')
            const func = context[method_name];
            (elem as HTMLElement).onclick = (event) => {
                if (values.includes('$event')) {
                    const i = values.indexOf('$event')
                    values[i] = event
                }
                func.apply(context, values)
            }

            elem.removeAttribute('bind-click')
        }
    })

    element.querySelectorAll('[bind-change]').forEach((elem) => {
        const method = elem.getAttribute('bind-change')!
        const method_name = method.split('(')[0]
        if (method_name in context) {
            const values: any[] = method.split('(')[1].split(')')[0].split(',')
            const func = context[method_name];
            (elem as HTMLElement).onchange = (event) => {
                if (values.includes('$event')) {
                    const i = values.indexOf('$event')
                    values[i] = event
                }
                func.apply(context, values)
            }

            elem.removeAttribute('bind-change')
        }
    })

    element.querySelectorAll('[bind-keyup]').forEach((elem) => {
        const method = elem.getAttribute('bind-keyup')!
        const method_name = method.split('(')[0]
        if (method_name in context) {
            const values: any[] = method.split('(')[1].split(')')[0].split(',')
            const func = context[method_name];
            (elem as HTMLElement).onkeyup = (event) => {
                if (values.includes('$event')) {
                    const i = values.indexOf('$event')
                    values[i] = event
                }
                func.apply(context, values)
            }

            elem.removeAttribute('bind-keyup')
        }
    })

    element.querySelectorAll('[bind-keydown]').forEach((elem) => {
        const method = elem.getAttribute('bind-keydown')!
        const method_name = method.split('(')[0]
        if (method_name in context) {
            const values: any[] = method.split('(')[1].split(')')[0].split(',')
            const func = context[method_name];
            (elem as HTMLElement).onkeydown = (event) => {
                if (values.includes('$event')) {
                    const i = values.indexOf('$event')
                    values[i] = event
                }
                func.apply(context, values)
            }

            elem.removeAttribute('bind-keydown')
        }
    })

    element.querySelectorAll('[bind-value]').forEach((elem) => {
        const key = elem.getAttribute('bind-value')!
        if (key in context) {
            const value: any = GetValueOf(key, context)
            elem.innerHTML = value
        }
    })

    return element
}

function OnChangeDetected(mutations: MutationRecord[]) {
    for (const mutation of mutations) {
        // on attr change
        if (mutation.type == 'attributes') {
            if (mutation.attributeName?.includes('bind-init-')) {
                const id = mutation.target.nodeName.toLowerCase()
                if (id in components) {
                    const key = mutation.attributeName.replace('bind-init-', ''),
                        value = (mutation.target as HTMLElement).getAttribute(mutation.attributeName),
                        component = (mutation.target as any).component

                    component._component_attr[key] = value
                    component._component_root!.querySelector(`[bind-value="${key}"]`)!.innerHTML = value
                    if (component.AttributeOnChange) component.AttributeOnChange()
                }
            }
        }
    }
}

interface AttrItem {
    name: string
    value: any
}