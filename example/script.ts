import { Component, ComponentHelper, Module, RenderComponent, RenderModule, RenderOnInit } from '../src'
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
class ElementContainerComponent extends ComponentHelper implements RenderOnInit {
    RenderOnInit(): void {
        setTimeout(() => {
            document.getElementById('one').setAttribute('bind-init-title', 'Goodbye')
        }, 3000);

        RenderComponent(ElementComponent, {
            Styles: {
                '--h1-color': 'red'
            },
            Classes: 'colored-h1',
            Values: {
                title: 'Hello-4'
            }
        }).then(element=> {
            this.Element.appendChild(element)
        })
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
