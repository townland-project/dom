import { Component, Module, RenderModule, RenderOnInit } from '../src'

@Component({
    id: 'tl-element',
    template: `
        <h1 bind-value="message"></h1>
        <h2 bind-value="title"></h2>
        <br/>
        <h3 bind-value="count"></h3>
        <button bind-click="submit()">Submit</button>`
})
class ElementComponent {
    public message = 'Message'
    public count = 1
    public title: string

    submit(): void {
        this.message = 'Hello World'
        this.count++
        (this as any)._component_changed()
    }
}

@Component({
    id: 'tl-element-container',
    template: `
        <tl-element id="one" bind-init-title="Hello"></tl-element>
        <tl-element bind-init-title="Hello-2"></tl-element>
        <tl-element bind-init-title="Hello-3"></tl-element>
    `,
    attr: {
        'class': 'flex column'
    }
})
class ElementContainerComponent implements RenderOnInit {
    RenderOnInit(): void {
        setTimeout(() => {
            ((this as any)._component_root as ShadowRoot).getElementById('one').setAttribute('bind-init-title', 'Goodbye')

        }, 3000);
    }
}

@Module({
    Component: [
        ElementComponent,
    ],
    Bootstrap: ElementContainerComponent
})
export class MainModule {
}

RenderModule(MainModule).then(element => document.body.appendChild(element))
