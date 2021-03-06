import { Attribute, Bind, Component, ComponentHelper } from '../../src'

@Component({
    id: 'tl-element',
    style: require('./styles.css'),
    template: require('./index.html')
})
export class ElementComponent extends ComponentHelper {
    @Bind('message') message = 'Message'
    @Bind('count') count = 1
    @Attribute('title') title = 'HW'

    AttributeOnChange() {
        console.log(this.Attributes)
    }

    submit(): void {
        this.message = 'Hello World'
        this.count++
    }
}