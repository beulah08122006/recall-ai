import { api } from './api';
import { Person, Item, Memory, Reminder } from '../types';

export interface PersonDetail extends Person {
  items: Item[];
  memories: Memory[];
  reminders: Reminder[];
}

export const peopleService = {
  async getPeople(params?: { search?: string }): Promise<Person[]> {
    const res = await api.get('/people', { params });
    return res.data.people;
  },

  async getPersonDetail(id: string): Promise<PersonDetail> {
    const res = await api.get(`/people/${id}`);
    return res.data;
  },

  async createPerson(data: { name: string; contact?: string; notes?: string }): Promise<Person> {
    const res = await api.post('/people', data);
    return res.data.person;
  },

  async updatePerson(id: string, data: Partial<Person>): Promise<Person> {
    const res = await api.put(`/people/${id}`, data);
    return res.data.person;
  },

  async deletePerson(id: string): Promise<void> {
    await api.delete(`/people/${id}`);
  },
};

