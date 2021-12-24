import { Component, Module, RenderModule, RenderOnInit } from '../src'
import { ElementComponent } from './element'

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
            document.getElementById('one').setAttribute('bind-init-title', 'Goodbye')
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
