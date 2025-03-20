import { Injectable } from '@angular/core';
import { MazeResponse } from '../models/maze.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MazeService {

  baseUrl = 'http://localhost:8080/api/v1/maze';

  constructor(private httpClient: HttpClient) {
  }

  getCurrentMaze(levelCategory: string, levelNumber: number): Observable<MazeResponse> {
    return this.httpClient.get<MazeResponse>(`${this.baseUrl}/level?levelCategory=${levelCategory}&levelNumber=${levelNumber}`);
  }
}