export function Bind(name: string) {
    return function (target: any, key: string) {
        const _prev = Object.getOwnPropertyDescriptor(target, key);
        let _value: any = target[key]

        const descriptor = {
            get(this: any) {
                if (_prev) _prev.get!()
                return _value

            },
            set: function (this: any, value: any) {
                if (this._component_root)
                    this._component_root!.querySelector(`[bind-value="${name}"]`)!.innerHTML = value

                if (_prev) _prev.set!(value);
                _value = value
            },
            enumerable: _prev == null ? true : _prev.enumerable,
            configurable: _prev == null ? true : _prev.configurable
        };

        Object.defineProperty(target, name, descriptor);
    }
}