import { Injectable } from '@angular/core';
import { HttpClient, HttpParams  } from '@angular/common/http';
import { forkJoin, Observable, of } from 'rxjs';
import { concatMap, expand, map, reduce, switchMap, takeWhile, toArray } from 'rxjs/operators';

export interface Journey {
  id: number;
  tripId: number;
  stepId: number;
  destination: string;
  description: string;
}

export interface Trip {
  type: string;
  startDate: string;
  endDate: string;
  vehicle: string;
  startDestination: { name: string, latitude: number, longitude: number };
  endDestination: { name: string, latitude: number, longitude: number };
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class ViaggiService {

  constructor(private http:HttpClient) { }

  url = "http://localhost:8765/api"
  tripUrl = `${this.url}/trips`;
  journeyUrl = `${this.url}/journeys`;
  tripData: any

  getFilteredTrip(filters: { startDate?: string, endDate?: string, tripsSize: number, page: number }): Observable<any> {
    let params = new HttpParams()
    .set('tripsSize', filters.tripsSize.toString())
    .set('page', filters.page.toString());

  if (filters.startDate) {
    params = params.set('startDate', filters.startDate);
  }
  if (filters.endDate) {
    params = params.set('endDate', filters.endDate);
  }

    return this.http.get(this.tripUrl, { params });
  }

  getAllTrips(tripsSize: number): Observable<any[]> {
    let page = 0;

    return this.fetchTripsPage(tripsSize, page).pipe(
      expand((tripPage: any[]) => 
        tripPage.length === tripsSize ? this.fetchTripsPage(tripsSize, ++page) : of([])),
      takeWhile(tripPage => tripPage.length > 0),
      reduce((acc, tripPage) => acc.concat(tripPage), [] as any[])
    );
  }

   fetchTripsPage(tripsSize: number, page: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.tripUrl}?tripsSize=${tripsSize}&page=${page}`);
  }

  createTrip(trip: Trip){
    return this.http.post(this.tripUrl, trip);
  }

  getTripById(id: number){
    const tripUrlId = `${this.tripUrl}/${id}`;
    return this.http.get(tripUrlId)
  }

  editTripById(id: number, trip: {
    userId: number, 
    startDate: string, 
    endDate: string, 
    vehicle: string,
    type: string, 
    startDestination: {
      latitude: number,
      longitude: number,
      name: string
    },
    endDestination: {
      latitude: number,
      longitude: number,
      name: string
    },
    description: string}){
    const tripUrlId = `${this.tripUrl}/${id}`;
    return this.http.put(tripUrlId, trip)
  }

  deleteTripById(tripId: number): Observable<void> {
    return this.getAllJourneysByTripId(tripId).pipe(
      switchMap(journeysToDelete =>
        Array.isArray(journeysToDelete) && journeysToDelete.length > 0
          ? this.deleteJourneys(journeysToDelete).pipe(
              // Then delete the trip
              switchMap(() => this.http.delete<void>(`${this.tripUrl}/${tripId}`))
            )
          : this.http.delete<void>(`${this.tripUrl}/${tripId}`)
      )
    );
  }
  private deleteJourneys(journeys: Journey[]): Observable<void> {
    const deleteRequests = journeys.map(journey =>
      this.http.delete<void>(`${this.journeyUrl}/${journey.id}`)
    );
    return forkJoin(deleteRequests).pipe(map(() => void 0));
  }

  getTripsCompleted(){
    const tripUrlCompleted = `${this.tripUrl}/completed`;
    return this.http.get(tripUrlCompleted)
  }

  setTripData(data: any) {
    this.tripData = data;
  }

  getTripData() {
    return this.tripData;
  }

  getNumberTrips(): Observable<any>{
    const tripUrlnumber = `${this.tripUrl}/total`;
    return this.http.get<any>(tripUrlnumber);
  }

  //Journey
  createJourney(journey: {tripId: number, destination: {name: string, latitude:number, longitude:number}, description: string}){
     return this.http.post(this.journeyUrl, journey)
  }

  getJourneyById(id: number){
    const journeyUrlId = `${this.journeyUrl}/${id}`;
    return this.http.get(journeyUrlId)
  }

  editJourneyById(id: number, journey: {tripId: number, destination: {name: string, latitude:number, longitude:number}, description: string}){
    const journeyUrlId = `${this.journeyUrl}/${id}`;
    return this.http.put(journeyUrlId, journey)
  }

  deleteJourneyById(id: number): Observable<void> {
    const journeyUrlId = `${this.journeyUrl}/${id}`;
    return this.http.delete<void>(journeyUrlId);
  }

  getAllJourneysByTripId(tripId: number){
    return this.http.get(`${this.journeyUrl}?tripId=${tripId}`);
  }
}

