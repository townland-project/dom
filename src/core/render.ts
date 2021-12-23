import { ComponentConfig } from "..";

let count = 0;

// default component methods
const _component_methods: string[] = ['_component_config', '_component_id', '_component_root', '_component_changed']

// dom change detection
const observer = new MutationObserver(OnChangeDetected);

let components: ComponentMap = {}

interface Module extends Function { new(...args: any[]): any; }
interface Component extends Function { new(...args: any[]): any; }
interface ValuesElement {
    [key: string]: any
}

interface ComponentOptions {
    Values?: ValuesElement
}

interface ComponentMap {
    [id: string]: Component
}

export async function RenderModule(Module: Module): Promise<HTMLElement | undefined> {
    let module = new Module()

    if (!module._module_config.Bootstrap) {
        console.error(`Module doesn't have Bootstrap.`)
        return undefined
    }

    return await RenderComponent(module._module_config.Bootstrap)
}

export async function RenderComponent(Component: Component | string, Options?: ComponentOptions): Promise<HTMLElement> {
    // create new instance of component
    let component = typeof Component == 'string' ? components[Component] : new Component()
    // if component was not exist
    if (component == undefined) {
        console.error(`You don't have '${Component}' component.`)
        return Promise.reject()
    }
    // read component config
    let config: ComponentConfig = component._component_config
    // fetch html url
    if (config.templateUrl) {
        try {
            let res = await fetch(config.templateUrl)
            config.template = await res.text()
        } catch (error) {
            console.error(`Cannot fetch '${config.id}/${config.templateUrl}'`)
            return Promise.reject()
        }
    }

    try {
        // create custom element 
        class CustomELement extends HTMLElement {
            private component: any;
            private prototype: any;

            constructor() {
                super()
                this.component = typeof Component == 'string' ? components[Component] : new Component();
                // set component id
                count++
                this.component._component_id = `CUID-${count}`
                // copy render values to component
                Object.assign(component, Options?.Values || {})
                // get all methods of class
                this.prototype = Object.getPrototypeOf(component)
                // if component on init method exist
                if (this.prototype.ComponentOnInit) this.prototype.ComponentOnInit.bind(component).call()
            }

            connectedCallback() {
                // append renderred component
                const shadow = this.attachShadow({ mode: 'open' });
                let range = document.createRange()
                // render component
                let dom: HTMLElement = RenderComponentTemplate(config.template!, this.component)

                range.selectNodeContents(dom)
                let content = range.extractContents()

                shadow.appendChild(content)
                // add attrs
                for (let key of Object.keys(config.attr || []))
                    this.setAttribute(key, config.attr![key])
                // set init value
                Array().slice
                    .apply(this.attributes)
                    .forEach((item: AttrItem) => {
                        if (item.name.includes('bind-init-')) {
                            let key = item.name.replace('bind-init-', '')
                            this.shadowRoot!.querySelector(`[bind-value="${key}"]`)!.innerHTML = item.value
                            Object.assign(this.component, { [key]: item.value })
                        }
                    });
                // add element id attr
                this.setAttribute(this.component._component_id, '')
                // set component root
                this.component._component_root = this.shadowRoot
                // component class data changed detection
                this.component._component_changed = () => {
                    for (let key of Object.keys(this.component)) {
                        if (!_component_methods.includes(key)) {
                            this.shadowRoot!.querySelectorAll(`[bind-value="${key}"]`).forEach(item => item.innerHTML = this.component[key])
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
        // define new html tag
        customElements.define(config.id, CustomELement)
        // fetch style url
        if (config.styleUrl) {
            try {
                let res = await fetch(config.styleUrl)
                config.style = await res.text()
            } catch (error) {
                console.error(`Cannot fetch '${config.id}/${config.styleUrl}'`)
                return Promise.reject()
            }
        }
        // create component style
        if (config.style) {
            let style = document.createElement('style')
            style.innerText = config.style
            style.setAttribute('component-id', config.id)
            document.head.appendChild(style)
        }
    } catch (error) {
        console.error(error)
    }
    // create element
    let element = document.createElement(config.id)
    // add component to map
    if (typeof Component != 'string') components[config.id] = component

    return element
}

function RenderComponentTemplate(template: string, context: any): HTMLElement {
    // {{ DATA }} replace
    template = template.replace(/{{(.*?)}}/g, (match: string) => GetValueOf(match.split(/{{|}}/).filter(Boolean)[0], context) || '')
    // convert string template to dom
    let dom = new DOMParser().parseFromString(template, 'text/html')

    return WalkInDom(dom, context)
}

function GetValueOf(key: string, context: any): any {
    let keys = key.split('.')
    if (keys.length > 1) {
        return GetValueOf(keys.slice(1).join('.'), context[keys[0]])
    } else {
        return context[key]
    }
}

function WalkInDom(doc: Document, context: any): HTMLElement {
    let element = doc.body

    element.querySelectorAll('[bind-click]').forEach((elem) => {
        let method = elem.getAttribute('bind-click')!
        let method_name = method.split('(')[0]
        if (method_name in context) {
            let values: any[] = method.split('(')[1].split(')')[0].split(',')
            let func = context[method_name];
            (elem as HTMLElement).onclick = (event) => {
                if (values.includes('$event')) {
                    let i = values.indexOf('$event')
                    values[i] = event
                }
                func.bind(context).apply(null, values);
            }
        }
    })

    element.querySelectorAll('[bind-change]').forEach((elem) => {
        let method = elem.getAttribute('bind-change')!
        let method_name = method.split('(')[0]
        if (method_name in context) {
            let values: any[] = method.split('(')[1].split(')')[0].split(',')
            let func = context[method_name];
            (elem as HTMLElement).onchange = (event) => {
                if (values.includes('$event')) {
                    let i = values.indexOf('$event')
                    values[i] = event
                }
                func.bind(context).apply(null, values);
            }
        }
    })

    element.querySelectorAll('[bind-value]').forEach((elem) => {
        let key = elem.getAttribute('bind-value')!
        if (key in context) {
            let value: any = GetValueOf(key, context)
            elem.innerHTML = value
        }
    })

    return element
}

function OnChangeDetected(mutations: MutationRecord[]) {
    for (let mutation of mutations) {
        // on attr change
        if (mutation.type == 'attributes') {
            if (mutation.attributeName?.includes('bind-init-')) {
                let id = mutation.target.nodeName.toLowerCase()
                if (id in components) {
                    let key = mutation.attributeName.replace('bind-init-', ''),
                        value = (mutation.target as HTMLElement).getAttribute(mutation.attributeName),
                        component = (mutation.target as any).component

                    component[key] = value
                    component._component_changed()
                }
            }
        }
    }
}

interface AttrItem {
    name: string
    value: any
}