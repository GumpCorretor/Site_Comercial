import { Injectable } from '@nestjs/common'

export type AppInfo = {
  name: string
  status: string
}

@Injectable()
export class AppService {
  getInfo(): AppInfo {
    return { name: '@repo/api', status: 'scaffold' }
  }
}
