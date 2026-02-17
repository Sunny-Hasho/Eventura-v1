import { api } from "./api";

export interface CreateReportRequest {
  reportedUserId: number;
  requestId?: number;
  reason: string;
}

export interface Report {
  id: number;
  reportedBy: { id: number; firstName: string; lastName: string; email: string };
  reportedUser: { id: number; firstName: string; lastName: string; email: string };
  request?: { id: number; title: string };
  reason: string;
  status: "PENDING" | "RESOLVED" | "DISMISSED";
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
}

export const reportService = {
  createReport: async (data: CreateReportRequest): Promise<Report> => {
    const response = await api.post("/reports", data);
    return response.data as Report;
  },

  getAllReports: async (status?: string, page = 0, size = 10): Promise<PageResponse<Report>> => {
    const response = await api.get("/reports/admin", {
      params: { status, page, size },
    });
    return response.data as PageResponse<Report>;
  },

  updateReportStatus: async (reportId: number, status: string): Promise<Report> => {
    const response = await api.put(`/reports/admin/${reportId}/status`, JSON.stringify(status), {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response.data as Report;
  },
};
