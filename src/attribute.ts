export function Attribute(name: string) {
    return function (target: any, key: string) {
        const _prev = Object.getOwnPropertyDescriptor(target, key);
        let _value: any = target[key]

        const descriptor = {
            get(this: any) {
                if (_prev) _prev.get!()
                else if (this._component_attr[name])
                    _value = this._component_attr[name]

                return _value
            },
            set: (value: any) => {
                if (_prev) _prev.set!(value);
                _value = value
            },
            enumerable: _prev == null ? true : _prev.enumerable,
            configurable: _prev == null ? true : _prev.configurable
        };

        Object.defineProperty(target, name, descriptor);
    }
}

export interface AttributeOnChange {
    AttributeOnChange(): void | Promise<void>
}