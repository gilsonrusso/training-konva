import { abortManager } from '../lib/abortManager'
import { api } from '../lib/axios'
import type { UpdateUserDto, User } from '../types/user.types'

type TUserService = {
  getAll: (signal: AbortSignal) => Promise<User[]>
  getById: (id: number) => Promise<User>
  createUser: (data: User) => Promise<User>
  updateUser: (id: number, data: UpdateUserDto) => Promise<User>
  deleteUser: (id: number) => Promise<void>
}

export const UserService: TUserService = {
  async getAll(signal: AbortSignal): Promise<User[]> {
    // const signal = abortManager.create('getAllUsers')
    const res = await api.get<User[]>('/users', { signal })
    return res.data
  },

  async getById(id: number): Promise<User> {
    const signal = abortManager.create(`getUser-${id}`)
    const res = await api.get<User>(`/users/${id}`, { signal })
    return res.data
  },

  async createUser(data: User): Promise<User> {
    const signal = abortManager.create('createUser')
    const res = await api.post<User>('/users', data, { signal })
    return res.data
  },

  async updateUser(id: number, data: UpdateUserDto): Promise<User> {
    const signal = abortManager.create(`updateUser-${id}`)
    const res = await api.put<User>(`/users/${id}`, data, { signal })
    return res.data
  },

  async deleteUser(id: number): Promise<void> {
    const signal = abortManager.create(`deleteUser-${id}`)
    await api.delete(`/users/${id}`, { signal })
  },
}
