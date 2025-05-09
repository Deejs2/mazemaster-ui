import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MazeResponse {
  status: boolean;
  statusCode: number;
  timestamp: string;
  message: string;
  data: MazeData[];
  error: any;
}

export interface MazeData {
  id: number;
  levelCategory: string;
  levelNumber: number;
  mazeData: number[][];
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  baseScore: number;
}

@Injectable({
  providedIn: 'root'
})
export class MazeService {
  private baseUrl = 'http://localhost:8080/api/v1/maze';

  constructor(private http: HttpClient) { }

  getMaze(levelCategory: string, levelNumber: number): Observable<MazeResponse> {
    return this.http.get<MazeResponse>(`${this.baseUrl}/level?levelCategory=${levelCategory}&levelNumber=${levelNumber}`);
  }
}