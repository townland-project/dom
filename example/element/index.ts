import { Attribute, Component, ComponentHelper } from '../../src'

@Component({
    id: 'tl-element',
    style: require('./styles.css'),
    template: require('./index.html')
})
export class ElementComponent extends ComponentHelper {
    public message = 'Message'
    public count = 1
    @Attribute('title') title: string = 'HW'

    AttributeOnChange() {
        console.log(this.Attributes)
    }

    submit(): void {
        this.message = 'Hello World'
        this.count++
        this.ValueChanged()
    }
}