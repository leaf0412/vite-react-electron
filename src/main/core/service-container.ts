import type { ServiceRegistry, ServiceName } from './types';

interface ServiceFactory<T = unknown> {
  (): T;
}

interface ServiceDefinition<T = unknown> {
  factory: ServiceFactory<T>;
  instance?: T;
  singleton?: boolean;
}

export class ServiceContainer {
  private services = new Map<string, ServiceDefinition>();

  register<K extends ServiceName>(
    name: K, 
    factory: ServiceFactory<ServiceRegistry[K]>, 
    singleton: boolean = true
  ): void {
    this.services.set(name, {
      factory,
      singleton
    });
  }

  get<K extends ServiceName>(name: K): ServiceRegistry[K] {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service "${name}" not found`);
    }

    if (service.singleton) {
      if (!service.instance) {
        service.instance = service.factory();
      }
      return service.instance as ServiceRegistry[K];
    }

    return service.factory() as ServiceRegistry[K];
  }

  has(name: string): boolean {
    return this.services.has(name);
  }

  async dispose(): Promise<void> {
    for (const [, service] of this.services.entries()) {
      if (service.instance && typeof service.instance === 'object') {
        const instance = service.instance as Record<string, unknown>;
        if (typeof instance.dispose === 'function') {
          await (instance.dispose as () => Promise<void>)();
        }
        if (typeof instance.destroy === 'function') {
          await (instance.destroy as () => Promise<void>)();
        }
      }
    }
    this.services.clear();
  }

  getRegisteredServices(): string[] {
    return Array.from(this.services.keys());
  }
} 