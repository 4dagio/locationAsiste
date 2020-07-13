import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/asiste-service';
import { ActivatedRoute, Params } from '@angular/router';

declare var google;

interface Marker {
  position: {
    lat: number,
    lng: number,
  };
  title: string;
}


interface ServiceModel{
  lat: number;
  long: number;
  estado: any;
  colaborador: any;
  foto: any;
  servicio: any;
}

export class StatusServiceModel{
  buscando : boolean;
  pendiente : boolean;
  encontrado : boolean;
  encamino : boolean; 
  enservicio: boolean;
  terminado: boolean;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  public status : StatusServiceModel;
  fromBaseURL: any;
  idService: any;
  isIdService: any;
  service: any;
  markers: Marker[] = [];
  map = null;
  foto : any;
  estado : any;
  myLatLng: any;
  colaborador : any;
  params: string;
  paramsData: any;
  public dataApi : ServiceModel; 
  lat: any;
  long: any;
  zoom = 12;
  id: string;

  constructor(public api: ApiService, private rutaActiva: ActivatedRoute,) {}

  ngOnInit(){
    this.status = new StatusServiceModel();
    this.status.buscando = true;
    this.isIdService = this.isBase64(this.rutaActiva.snapshot.params.params);
    if(this.isIdService){
      let params = atob(this.rutaActiva.snapshot.params.params);
      let paramsFormat = params.split('|');
      this.idService = paramsFormat[6];
    }else{
    this.idService = this.rutaActiva.snapshot.params.params;
    }
    this.loadMap();
    this.status.buscando = true;
    setInterval(() => {
      this.renderMarkers(this.idService);
    }, 30000);
  }

  loadMap() {
   if(this.isIdService){
      this.params = atob(this.rutaActiva.snapshot.params.params)
      let paramsFormat = this.params.split('|');
      this.lat = Number(paramsFormat[0]);3
      this.long = Number(paramsFormat[1]);
      this.service = paramsFormat[2];
      this.estado = paramsFormat[3];
      this.colaborador = `${paramsFormat[4]} ${paramsFormat[5]}`;
      this.id = paramsFormat[6];
      this.zoom = 15;
      const mapEle: HTMLElement = document.getElementById('map');
      // create LatLng object
      const myLatLng = {lat: this.lat , lng: this.long};
      // create map
      this.map = new google.maps.Map(mapEle, {
        center: myLatLng,
        zoom: 16
      });
      this.markers =  [
        {
          position: {
            lat: this.lat,
            lng: this.long,
          },
          title: this.colaborador
        }
      ]
      google.maps.event.addListenerOnce(this.map, 'idle', () => {
        this.markers.forEach(marker => {
          this.addMarker(marker);
        });
        mapEle.classList.add('show-map');
      });
    }else{

    // create a new map by passing HTMLElement
    const mapEle: HTMLElement = document.getElementById('map');
    // create LatLng object
    const myLatLng = {lat: 4.570868 , lng: -74.297333};
    // create map
    this.map = new google.maps.Map(mapEle, {
      center: myLatLng,
      zoom: 10
    });
    google.maps.event.addListenerOnce(this.map, 'idle', () => {
      this.renderMarkers(this.idService);
      mapEle.classList.add('show-map');
    });
   }
  }

  renderMarkers(str) {
    if(this.estado == undefined || this.estado == 'Fuera de linea' || this.estado == 'Pendiente' || this.estado == 'En curso'
       ||this.estado == "Ejecución" || this.estado.includes('Pendiente')) {
         
    this.api.reloadLocation(str).subscribe((data: ServiceModel) => {
      console.log(data);
      this.markers =  [
        {
          position: {
            lat: data.lat,
            lng: data.long,
          },
          title: data.colaborador
        }
      ]
      
      let mapEle: HTMLElement = document.getElementById('map');
      if(!data.lat || !data.long ){
        this.myLatLng = {lat: 4.570868, lng: -74.297333}; 
      }else{
      this.myLatLng = {lat: data.lat, lng: data.long};
     
      this.foto = data.foto;
      this.colaborador = data.colaborador;
      this.service = data.servicio;
      this.estado = data.estado;
      this.map = new google.maps.Map(mapEle, {
        center: this.myLatLng,
        zoom: 16
      });
      
      this.markers.forEach(marker => {
        this.addMarker(marker);
      });
      //Estados
      if(data.estado == 'Fuera de linea' || data.estado == 'Pendiente' ){
        this.status.encontrado = true;
        return;
      }
  
      if(data.estado == 'En curso'){
        this.status.encontrado = true;
        this.status.encamino = true;
        return;
      }
  
      if(data.estado == "Ejecución"){
        this.status.encontrado = true;
        this.status.encamino = true;
        this.status.enservicio = true;
        return;
      }
  
      if(data.estado == 'Terminado' || data.estado == "Fallido"){
        this.status.encontrado = true;
        this.status.encamino = true;
        this.status.enservicio = true;
        this.status.terminado = true;
        return;
        }
      }
      })
    }else{
      console.log("Estado: Terminado");
    } 
  }

  addMarker(marker: Marker) {
    return new google.maps.Marker({
      position: marker.position,
      map: this.map,
      title: marker.title
    });
  }

  isBase64(str) {
    var validateSting =  atob(str)
    console.log(validateSting);
    try {
      if(validateSting.includes('|')){
        return true;
      }else{
        return false;
      };
    } catch (err) {
      return false;
    }
  }
}

  
