const manager = new class DependencyManager {
    private deps: Record<string, any>;
    constructor() {
        this.deps = {};
    }

    // return class instance for this key
    get(key: string) {
        const matches = this.deps[key];
        if (!matches) throw new Error("No Matches Found");
        return matches;
    }

    // store given class instance 
    set(key: string, dep: any) {
        this.deps[key] = dep;
    }
}


export function Service(key: string) {
    return function (classInstance: any, propertyName: string) {
        let service = manager.get(key)        

        classInstance[propertyName] = service   

        return classInstance[propertyName]
    };
}

export function InjectableService(key: string): Function {
    return function (InjectableClass: { new(): any }) {
        manager.set(key, new InjectableClass());
    };
}