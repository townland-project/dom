import { Component } from '../../src'

@Component({
    id: 'tl-element',
    style: require('./styles.css'),
    template: require('./index.html')
})
export class ElementComponent {
    public message = 'Message'
    public count = 1
    public title: string

    submit(): void {
        this.message = 'Hello World'
        this.count++
        (this as any)._component_changed()
    }
}