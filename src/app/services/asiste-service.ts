import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
providedIn: 'root'
})
export class ApiService {
    

private SERVER_URL = "http://3.15.234.247:8080/AsistePlatform";

constructor(private httpClient: HttpClient) {
    
}

public reloadLocation(id: string){
    
    return this.httpClient.get(`/api/AsistePlatform/UbicationLinkAPI.jsn?id=${id}`);
    }
 }