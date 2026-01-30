import { config } from '../config.js';

const request = (url, method = 'GET', data = {}) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${config.baseUrl}${url}`,
      method: method,
      data: data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.publicAnonKey}`
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject(res.data || 'Request failed');
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

export const api = {
  getTickets: (offset = 0, limit = 50) => request(`/tickets?offset=${offset}&limit=${limit}`),
  createTicket: (ticket) => request('/tickets', 'POST', ticket),
  updateTicket: (id, updates) => request(`/tickets/${id}`, 'PUT', updates),
  seedTickets: () => request('/seed', 'POST')
};
