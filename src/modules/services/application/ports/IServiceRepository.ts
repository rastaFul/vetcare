import { Service } from '../../domain/entities/Service'

export interface IServiceRepository {
  save(service: Service): Promise<void>
  update(service: Service): Promise<void>
  findById(id: string, tenantId: string): Promise<Service | null>
  list(tenantId: string, activeOnly?: boolean): Promise<Service[]>
}
