import * as tslib_1 from "tslib";

var PatientService_1;
import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {
    AuthServerProvider,
    createRequestOption,
    DATE_FORMAT,
    SERVER_API_URL_CONFIG,
    ServerApiUrlConfig
} from '@lamis/web-core';
import {map, share} from 'rxjs/operators';
import * as moment_ from 'moment';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common/http";
import * as i2 from "@lamis/web-core";

const moment = moment_;
let PatientService = PatientService_1 = class PatientService {
    constructor(http, serverUrl, authServerProvider) {
        this.http = http;
        this.serverUrl = serverUrl;
        this.authServerProvider = authServerProvider;
        this.resourceUrl = '';
        this.resourceSearchUrl = '';
        this.ovcResourceUrl = '';
        this.resourceUrl = serverUrl.SERVER_API_URL + '/api/patients';
        this.resourceSearchUrl = serverUrl.SERVER_API_URL + '/api/_search/patients';
        this.ovcResourceUrl = serverUrl.SERVER_API_URL + '/api/ovcs';
    }

    create(data) {
        const patient = this.convertDateFromClient(data);
        return this.http
            .post(this.resourceUrl, patient, {observe: 'response'})
            .pipe(map((res) => this.convertDateFromServer(res)));
    }

    update(data) {
        const patient = this.convertDateFromClient(data);
        return this.http
            .put(this.resourceUrl, patient, {observe: 'response'})
            .pipe(map((res) => this.convertDateFromServer(res)), share());
    }

    find(id) {
        return this.http
            .get(`${this.resourceUrl}/${id}`, {observe: 'response'})
            .pipe(map((res) => this.convertDateFromServer(res)));
    }

    findByUuid(id) {
        return this.http
            .get(`${this.resourceUrl}/by-uuid/${id}`, {observe: 'response'})
            .pipe(map((res) => this.convertDateFromServer(res)));
    }

    query(req) {
        const options = createRequestOption(req);
        return this.http
            .get(this.resourceUrl, {params: options, observe: 'response'})
            .pipe(map((res) => this.convertDateArrayFromServer(res)));
    }

    delete(id) {
        return this.http.delete(`${this.resourceUrl}/${id}`, {observe: 'response'});
    }

    getOVCByPatient(id) {
        return this.http.get(`${this.ovcResourceUrl}/patient/${id}`);
    }

    widgets(patientId) {
        return this.http.get(`${this.resourceUrl}/${patientId}/widgets`, {observe: 'body'});
    }

    observations(patientId) {
        return this.http.get(`${this.resourceUrl}/${patientId}/observations`, {
            observe: 'body'
        });
    }

    activities(patientId, detailed) {
        return this.http.get(`${this.resourceUrl}/${patientId}/activities?full=${detailed}`, {observe: 'body'})
            .pipe(map(res => {
                res.sort((t1, t2) => {
                    const d1 = moment(t1.date, 'DD MMM, YYYY');
                    const d2 = moment(t2.date, 'DD MMM, YYYY');
                    return d2.diff(d1);
                });
                return res;
            }));
    }

    getActiveFacility() {
        return this.http.get('/api/facilities/active');
    }

    getAllFacility() {
        return this.http.get('/api/facilities');
    }

    getStates() {
        return this.http.get('/api/states');
    }

    getLgasByState(id) {
        return this.http.get(`/api/provinces/state/${id}`);
    }

    getStateByLga(id) {
        return this.http.get(`/api/provinces/${id}/state`);
    }

    getFacility(id) {
        return this.http.get(`/api/facilities/${id}`);
    }

    existsByHospitalNumber(hospitalNum) {
        return this.http.post(`${this.resourceUrl}/exists/hospital-number`, {number: hospitalNum})
            .pipe(map((res => res ? {'numberExists': true} : null)));
    }

    getStatusDatesByPatient(patientId) {
        return this.http.get(`/api/client-statuses/patient/${patientId}/status-dates`)
            .pipe(map((res) => {
                res.forEach(d => moment(d));
                return res;
            }));
    }

    getSummaryForPatient(id) {
        return this.http.get(`${this.resourceUrl}/${id}/summary`);
    }

    saveClientStatus(status) {
        console.log('Status', status);
        const copy = PatientService_1.convertStatusFromClient(status);
        console.log('Copy', copy);
        return this.http.post('/api/client-statuses', copy, {observe: 'response'});
    }

    updateClientStatus(status) {
        const copy = PatientService_1.convertStatusFromClient(status);
        return this.http.put('/api/client-statuses', copy, {observe: 'response'});
    }

    findClientStatus(id) {
        return this.http.get(`/api/client-statuses/by-uuid/${id}`, {observe: 'response'})
            .pipe(map((res) => {
                res.body.dateTracked = res.body.dateTracked != null ? moment(res.body.dateTracked) : null;
                res.body.dateStatus = res.body.dateStatus != null ? moment(res.body.dateStatus) : null;
                res.body.agreedDate = res.body.agreedDate != null ? moment(res.body.agreedDate) : null;
                return res;
            }));
    }

    currentClientStatus(patientId) {
        return this.http.get(`/api/client-statuses/patient/${patientId}/current`, {responseType: 'text'});
    }

    getStatusName(id) {
        return this.http.get(`/api/client-statuses/${id}/name`, {responseType: 'text'});
    }

    static convertStatusFromClient(status) {
        const copy = Object.assign({}, status, {
            dateStatus: status.dateStatus != null && status.dateStatus.isValid() ? status.dateStatus.format(DATE_FORMAT) : null,
            agreedDate: status.agreedDate != null && status.agreedDate.isValid() ? status.agreedDate.format(DATE_FORMAT) : null,
            dateTracked: status.dateTracked != null && status.dateTracked.isValid() ? status.dateTracked.format(DATE_FORMAT) : null,
        });
        return copy;
    }

    convertDateFromClient(patient) {
        const copy = Object.assign({}, patient, {
            dateBirth: patient.dateBirth != null && patient.dateBirth.isValid() ? patient.dateBirth.format(DATE_FORMAT) : null,
            dateRegistration: patient.dateRegistration != null && patient.dateRegistration.isValid() ? patient.dateRegistration.format(DATE_FORMAT) : null,
            dateStarted: patient.dateStarted != null && patient.dateStarted.isValid() ? patient.dateStarted.format(DATE_FORMAT) : null,
            dateConfirmedHiv: patient.dateConfirmedHiv != null && patient.dateConfirmedHiv.isValid() ? patient.dateConfirmedHiv.format(DATE_FORMAT) : null,
            dateEnrolledPMTCT: patient.dateEnrolledPMTCT != null && patient.dateEnrolledPMTCT.isValid() ? patient.dateEnrolledPMTCT.format(DATE_FORMAT) : null,
            pregnant: patient.pregnancyStatus === 2,
            breastfeeding: patient.pregnancyStatus === 3
        });
        return copy;
    }

    convertDateFromServer(res) {
        if (res.body) {
            res.body.name = res.body.surname + ', ' + res.body.otherNames;
            res.body.dateBirth = res.body.dateBirth != null ? moment(res.body.dateBirth) : null;
            res.body.dateRegistration = res.body.dateRegistration != null ? moment(res.body.dateRegistration) : null;
            res.body.dateConfirmedHiv = res.body.dateConfirmedHiv != null ? moment(res.body.dateConfirmedHiv) : null;
            res.body.dateEnrolledPMTCT = res.body.dateEnrolledPMTCT != null ? moment(res.body.dateEnrolledPMTCT) : null;
            res.body.dateStarted = res.body.dateStarted != null ? moment(res.body.dateStarted) : null;
            res.body.pregnancyStatus = res.body.pregnant != null && res.body.pregnant ? 2 : res.body.gender === 'FEMALE' ? 1 : null;
            res.body.pregnancyStatus = res.body.breastfeeding != null && res.body.breastfeeding ? 3 : res.body.gender === 'FEMALE' ? 1 : null;
        }
        return res;
    }

    convertDateArrayFromServer(res) {
        if (res.body) {
            res.body.forEach((patient) => {
                patient.name = patient.surname + ', ' + patient.otherNames;
                patient.dateBirth = patient.dateBirth != null ? moment(patient.dateBirth) : null;
                patient.dateRegistration = patient.dateRegistration != null ? moment(patient.dateRegistration) : null;
                patient.dateStarted = patient.dateStarted != null ? moment(patient.dateStarted) : null;
            });
        }
        return res;
    }
};
PatientService.ctorParameters = () => [
    {type: HttpClient},
    {type: undefined, decorators: [{type: Inject, args: [SERVER_API_URL_CONFIG,]}]},
    {type: AuthServerProvider}
];
PatientService.ngInjectableDef = i0.ɵɵdefineInjectable({
    factory: function PatientService_Factory() {
        return new PatientService(i0.ɵɵinject(i1.HttpClient), i0.ɵɵinject(i2.SERVER_API_URL_CONFIG), i0.ɵɵinject(i2.AuthServerProvider));
    }, token: PatientService, providedIn: "root"
});
PatientService = PatientService_1 = tslib_1.__decorate([
    Injectable({providedIn: 'root'}),
    tslib_1.__param(1, Inject(SERVER_API_URL_CONFIG)),
    tslib_1.__metadata("design:paramtypes", [HttpClient, Object, AuthServerProvider])
], PatientService);
export {PatientService};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF0aWVudC5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbGFtaXMtcGF0aWVudC0xLjQuMC8iLCJzb3VyY2VzIjpbImxpYi9zZXJ2aWNlcy9wYXRpZW50LnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxPQUFPLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNuRCxPQUFPLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBRWhFLE9BQU8sRUFDSCxrQkFBa0IsRUFDbEIsbUJBQW1CLEVBQ25CLFdBQVcsRUFDWCxxQkFBcUIsRUFDckIsa0JBQWtCLEVBQ3JCLE1BQU0saUJBQWlCLENBQUM7QUFDekIsT0FBTyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUc1QyxPQUFPLEtBQUssT0FBTyxNQUFNLFFBQVEsQ0FBQzs7OztBQU1sQyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUM7QUFvQ3ZCLElBQWEsY0FBYyxzQkFBM0IsTUFBYSxjQUFjO0lBS3ZCLFlBQXNCLElBQWdCLEVBQXlDLFNBQTZCLEVBQ3hGLGtCQUFzQztRQURwQyxTQUFJLEdBQUosSUFBSSxDQUFZO1FBQXlDLGNBQVMsR0FBVCxTQUFTLENBQW9CO1FBQ3hGLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7UUFMbkQsZ0JBQVcsR0FBRyxFQUFFLENBQUM7UUFDakIsc0JBQWlCLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLG1CQUFjLEdBQUcsRUFBRSxDQUFDO1FBSXhCLElBQUksQ0FBQyxXQUFXLEdBQUcsU0FBUyxDQUFDLGNBQWMsR0FBRyxlQUFlLENBQUM7UUFDOUQsSUFBSSxDQUFDLGlCQUFpQixHQUFHLFNBQVMsQ0FBQyxjQUFjLEdBQUcsdUJBQXVCLENBQUM7UUFDNUUsSUFBSSxDQUFDLGNBQWMsR0FBRyxTQUFTLENBQUMsY0FBYyxHQUFHLFdBQVcsQ0FBQztJQUNqRSxDQUFDO0lBRUQsTUFBTSxDQUFDLElBQWE7UUFDaEIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pELE9BQU8sSUFBSSxDQUFDLElBQUk7YUFDWCxJQUFJLENBQVUsSUFBSSxDQUFDLFdBQVcsRUFBRSxPQUFPLEVBQUUsRUFBQyxPQUFPLEVBQUUsVUFBVSxFQUFDLENBQUM7YUFDL0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQXVCLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDakYsQ0FBQztJQUVELE1BQU0sQ0FBQyxJQUFhO1FBQ2hCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqRCxPQUFPLElBQUksQ0FBQyxJQUFJO2FBQ1gsR0FBRyxDQUFVLElBQUksQ0FBQyxXQUFXLEVBQUUsT0FBTyxFQUFFLEVBQUMsT0FBTyxFQUFFLFVBQVUsRUFBQyxDQUFDO2FBQzlELElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUF1QixFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLENBQUMsRUFDbkUsS0FBSyxFQUFFLENBQUMsQ0FBQztJQUNyQixDQUFDO0lBRUQsSUFBSSxDQUFDLEVBQU87UUFDUixPQUFPLElBQUksQ0FBQyxJQUFJO2FBQ1gsR0FBRyxDQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUMsQ0FBQzthQUNoRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBdUIsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNqRixDQUFDO0lBRUQsVUFBVSxDQUFDLEVBQU87UUFDZCxPQUFPLElBQUksQ0FBQyxJQUFJO2FBQ1gsR0FBRyxDQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsWUFBWSxFQUFFLEVBQUUsRUFBRSxFQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUMsQ0FBQzthQUN4RSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBdUIsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNqRixDQUFDO0lBRUQsS0FBSyxDQUFDLEdBQVM7UUFDWCxNQUFNLE9BQU8sR0FBRyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN6QyxPQUFPLElBQUksQ0FBQyxJQUFJO2FBQ1gsR0FBRyxDQUFZLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUMsQ0FBQzthQUN4RSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBNEIsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMzRixDQUFDO0lBRUQsTUFBTSxDQUFDLEVBQVU7UUFDYixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFNLEdBQUcsSUFBSSxDQUFDLFdBQVcsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUMsQ0FBQyxDQUFDO0lBQ3JGLENBQUM7SUFFRCxlQUFlLENBQUMsRUFBVTtRQUN0QixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFNLEdBQUcsSUFBSSxDQUFDLGNBQWMsWUFBWSxFQUFFLEVBQUUsQ0FBQyxDQUFBO0lBQ3JFLENBQUM7SUFFRCxPQUFPLENBQUMsU0FBaUI7UUFDckIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBa0IsR0FBRyxJQUFJLENBQUMsV0FBVyxJQUFJLFNBQVMsVUFBVSxFQUFFLEVBQUMsT0FBTyxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUE7SUFDeEcsQ0FBQztJQUVELFlBQVksQ0FBQyxTQUFpQjtRQUMxQixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUF1QixHQUFHLElBQUksQ0FBQyxXQUFXLElBQUksU0FBUyxlQUFlLEVBQUU7WUFDeEYsT0FBTyxFQUFFLE1BQU07U0FDbEIsQ0FBQyxDQUFBO0lBQ04sQ0FBQztJQUVELFVBQVUsQ0FBQyxTQUFpQixFQUFFLFFBQWlCO1FBQzNDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQW9CLEdBQUcsSUFBSSxDQUFDLFdBQVcsSUFBSSxTQUFTLG9CQUFvQixRQUFRLEVBQUUsRUFBRSxFQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUMsQ0FBQzthQUNySCxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ1osR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRTtnQkFDaEIsTUFBTSxFQUFFLEdBQUcsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsY0FBYyxDQUFDLENBQUM7Z0JBQzNDLE1BQU0sRUFBRSxHQUFHLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLGNBQWMsQ0FBQyxDQUFDO2dCQUMzQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDdkIsQ0FBQyxDQUFDLENBQUM7WUFDSCxPQUFPLEdBQUcsQ0FBQztRQUNmLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDWCxDQUFDO0lBRUQsaUJBQWlCO1FBQ2IsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBVyx3QkFBd0IsQ0FBQyxDQUFBO0lBQzVELENBQUM7SUFFRCxjQUFjO1FBQ1YsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBYSxpQkFBaUIsQ0FBQyxDQUFBO0lBQ3ZELENBQUM7SUFFRCxTQUFTO1FBQ0wsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBUSxhQUFhLENBQUMsQ0FBQTtJQUM5QyxDQUFDO0lBRUQsY0FBYyxDQUFDLEVBQUU7UUFDYixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFRLHdCQUF3QixFQUFFLEVBQUUsQ0FBQyxDQUFBO0lBQzdELENBQUM7SUFFRCxhQUFhLENBQUMsRUFBRTtRQUNaLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEVBQUUsUUFBUSxDQUFDLENBQUE7SUFDdEQsQ0FBQztJQUVELFdBQVcsQ0FBQyxFQUFFO1FBQ1YsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxFQUFFLENBQUMsQ0FBQTtJQUNqRCxDQUFDO0lBRUQsc0JBQXNCLENBQUMsV0FBbUI7UUFDdEMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBVSxHQUFHLElBQUksQ0FBQyxXQUFXLHlCQUF5QixFQUFFLEVBQUMsTUFBTSxFQUFFLFdBQVcsRUFBQyxDQUFDO2FBQzlGLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBQyxjQUFjLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBRUQsdUJBQXVCLENBQUMsU0FBaUI7UUFDckMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBVyxnQ0FBZ0MsU0FBUyxlQUFlLENBQUM7YUFDbkYsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO1lBQ1YsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVCLE9BQU8sR0FBRyxDQUFDO1FBQ2YsQ0FBQyxDQUFDLENBQ0wsQ0FBQTtJQUNULENBQUM7SUFFRCxvQkFBb0IsQ0FBQyxFQUFVO1FBQzNCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQVksR0FBRyxJQUFJLENBQUMsV0FBVyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUE7SUFDeEUsQ0FBQztJQUVELGdCQUFnQixDQUFDLE1BQXFCO1FBQ2xDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzlCLE1BQU0sSUFBSSxHQUFHLGdCQUFjLENBQUMsdUJBQXVCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDNUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDMUIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBZ0Isc0JBQXNCLEVBQUUsSUFBSSxFQUFFLEVBQUMsT0FBTyxFQUFFLFVBQVUsRUFBQyxDQUFDLENBQUE7SUFDN0YsQ0FBQztJQUVELGtCQUFrQixDQUFDLE1BQXFCO1FBQ3BDLE1BQU0sSUFBSSxHQUFHLGdCQUFjLENBQUMsdUJBQXVCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDNUQsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBZ0Isc0JBQXNCLEVBQUUsSUFBSSxFQUFFLEVBQUMsT0FBTyxFQUFFLFVBQVUsRUFBQyxDQUFDLENBQUE7SUFDNUYsQ0FBQztJQUVELGdCQUFnQixDQUFDLEVBQUU7UUFDZixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFnQixnQ0FBZ0MsRUFBRSxFQUFFLEVBQUUsRUFBQyxPQUFPLEVBQUUsVUFBVSxFQUFDLENBQUM7YUFDM0YsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQWdDLEVBQUUsRUFBRTtZQUMzQyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDMUYsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ3ZGLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUN2RixPQUFPLEdBQUcsQ0FBQztRQUNmLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDWCxDQUFDO0lBRUQsbUJBQW1CLENBQUMsU0FBaUI7UUFDakMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxnQ0FBZ0MsU0FBUyxVQUFVLEVBQUUsRUFBQyxZQUFZLEVBQUUsTUFBTSxFQUFDLENBQUMsQ0FBQTtJQUNyRyxDQUFDO0lBRUQsYUFBYSxDQUFDLEVBQVU7UUFDcEIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsRUFBRSxPQUFPLEVBQUUsRUFBQyxZQUFZLEVBQUUsTUFBTSxFQUFDLENBQUMsQ0FBQTtJQUNuRixDQUFDO0lBRU8sTUFBTSxDQUFDLHVCQUF1QixDQUFDLE1BQXFCO1FBQ3hELE1BQU0sSUFBSSxHQUFrQixNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUU7WUFDOUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxVQUFVLElBQUksSUFBSSxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJO1lBQ25ILFVBQVUsRUFBRSxNQUFNLENBQUMsVUFBVSxJQUFJLElBQUksSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSTtZQUNuSCxXQUFXLEVBQUUsTUFBTSxDQUFDLFdBQVcsSUFBSSxJQUFJLElBQUksTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUk7U0FDMUgsQ0FDSixDQUFDO1FBQ0YsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVTLHFCQUFxQixDQUFDLE9BQWdCO1FBQzVDLE1BQU0sSUFBSSxHQUFZLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRTtZQUM3QyxTQUFTLEVBQUUsT0FBTyxDQUFDLFNBQVMsSUFBSSxJQUFJLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUk7WUFDbEgsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLGdCQUFnQixJQUFJLElBQUksSUFBSSxPQUFPLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUk7WUFDOUksV0FBVyxFQUFFLE9BQU8sQ0FBQyxXQUFXLElBQUksSUFBSSxJQUFJLE9BQU8sQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJO1lBQzFILGdCQUFnQixFQUFFLE9BQU8sQ0FBQyxnQkFBZ0IsSUFBSSxJQUFJLElBQUksT0FBTyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJO1lBQzlJLGlCQUFpQixFQUFFLE9BQU8sQ0FBQyxpQkFBaUIsSUFBSSxJQUFJLElBQUksT0FBTyxDQUFDLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJO1lBQ2xKLFFBQVEsRUFBRSxPQUFPLENBQUMsZUFBZSxLQUFLLENBQUM7WUFDdkMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxlQUFlLEtBQUssQ0FBQztTQUMvQyxDQUFDLENBQUM7UUFDSCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRVMscUJBQXFCLENBQUMsR0FBdUI7UUFDbkQsSUFBSSxHQUFHLENBQUMsSUFBSSxFQUFFO1lBQ1YsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO1lBQzlELEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNwRixHQUFHLENBQUMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDekcsR0FBRyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLGdCQUFnQixJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ3pHLEdBQUcsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUM1RyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDMUYsR0FBRyxDQUFDLElBQUksQ0FBQyxlQUFlLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDeEgsR0FBRyxDQUFDLElBQUksQ0FBQyxlQUFlLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLElBQUksSUFBSSxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7U0FDckk7UUFDRCxPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUM7SUFFUywwQkFBMEIsQ0FBQyxHQUE0QjtRQUM3RCxJQUFJLEdBQUcsQ0FBQyxJQUFJLEVBQUU7WUFDVixHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQWdCLEVBQUUsRUFBRTtnQkFDbEMsT0FBTyxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsT0FBTyxHQUFHLElBQUksR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDO2dCQUMzRCxPQUFPLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQ2pGLE9BQU8sQ0FBQyxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztnQkFDdEcsT0FBTyxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQzNGLENBQUMsQ0FBQyxDQUFDO1NBQ047UUFDRCxPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUM7Q0FDSixDQUFBOztZQS9MK0IsVUFBVTs0Q0FBRyxNQUFNLFNBQUMscUJBQXFCO1lBQzdCLGtCQUFrQjs7O0FBTmpELGNBQWM7SUFEMUIsVUFBVSxDQUFDLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQyxDQUFDO0lBTVksbUJBQUEsTUFBTSxDQUFDLHFCQUFxQixDQUFDLENBQUE7NkNBQTFDLFVBQVUsVUFDRSxrQkFBa0I7R0FOakQsY0FBYyxDQW9NMUI7U0FwTVksY0FBYyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdCwgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgSHR0cENsaWVudCwgSHR0cFJlc3BvbnNlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtcbiAgICBBdXRoU2VydmVyUHJvdmlkZXIsXG4gICAgY3JlYXRlUmVxdWVzdE9wdGlvbixcbiAgICBEQVRFX0ZPUk1BVCxcbiAgICBTRVJWRVJfQVBJX1VSTF9DT05GSUcsXG4gICAgU2VydmVyQXBpVXJsQ29uZmlnXG59IGZyb20gJ0BsYW1pcy93ZWItY29yZSc7XG5pbXBvcnQgeyBtYXAsIHNoYXJlIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHsgT1ZDLCBQYXRpZW50LCBTdGF0dXNIaXN0b3J5IH0gZnJvbSAnLi4vbW9kZWwvcGF0aWVudC5tb2RlbCc7XG5cbmltcG9ydCAqIGFzIG1vbWVudF8gZnJvbSAnbW9tZW50JztcbmltcG9ydCB7IE1vbWVudCB9IGZyb20gJ21vbWVudCc7XG5pbXBvcnQgeyBGYWNpbGl0eSB9IGZyb20gJy4uL21vZGVsL2ZhY2lsaXR5Lm1vZGVsJztcbmltcG9ydCB7IFZhbGlkYXRpb25FcnJvcnMgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5pbXBvcnQgeyBTdW1tYXJ5IH0gZnJvbSAnLi4vY29tcG9uZW50cy9zdW1tYXJ5LndpZGdldC5jb21wb25lbnQnO1xuXG5jb25zdCBtb21lbnQgPSBtb21lbnRfO1xuXG50eXBlIEVudGl0eVJlc3BvbnNlVHlwZSA9IEh0dHBSZXNwb25zZTxQYXRpZW50PjtcbnR5cGUgRW50aXR5QXJyYXlSZXNwb25zZVR5cGUgPSBIdHRwUmVzcG9uc2U8UGF0aWVudFtdPjtcblxuZXhwb3J0IGludGVyZmFjZSBQYXRpZW50QWN0aXZpdHkge1xuICAgIHV1aWQ/OiBzdHJpbmc7XG4gICAgaWQ/OiBhbnk7XG4gICAgbmFtZT86IHN0cmluZztcbiAgICBpY29uPzogc3RyaW5nO1xuICAgIHBhdGg/OiBzdHJpbmc7XG4gICAgZWRpdGFibGU/OiBib29sZWFuO1xuICAgIHZpZXdhYmxlPzogYm9vbGVhbjtcbiAgICBkZWxldGFibGU/OiBib29sZWFuO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFBhdGllbnRUaW1lbGluZSB7XG4gICAgZGF0ZT86IHN0cmluZztcbiAgICBhY3Rpdml0aWVzPzogUGF0aWVudEFjdGl2aXR5W107XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGF0aWVudFdpZGdldCB7XG4gICAgdGl0bGU6IHN0cmluZztcbiAgICBjb21wb25lbnROYW1lOiBzdHJpbmc7XG4gICAgaW5kZXg6IG51bWJlcjtcbiAgICBpY29uPzogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFBhdGllbnRPYnNlcnZhdGlvbiB7XG4gICAgbmFtZT86IHN0cmluZztcbiAgICBwYXRoPzogc3RyaW5nO1xuICAgIGljb24/OiBzdHJpbmc7XG4gICAgdG9vbHRpcD86IHN0cmluZztcbn1cblxuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXG5leHBvcnQgY2xhc3MgUGF0aWVudFNlcnZpY2Uge1xuICAgIHB1YmxpYyByZXNvdXJjZVVybCA9ICcnO1xuICAgIHB1YmxpYyByZXNvdXJjZVNlYXJjaFVybCA9ICcnO1xuICAgIHByaXZhdGUgb3ZjUmVzb3VyY2VVcmwgPSAnJztcblxuICAgIGNvbnN0cnVjdG9yKHByb3RlY3RlZCBodHRwOiBIdHRwQ2xpZW50LCBASW5qZWN0KFNFUlZFUl9BUElfVVJMX0NPTkZJRykgcHJpdmF0ZSBzZXJ2ZXJVcmw6IFNlcnZlckFwaVVybENvbmZpZyxcbiAgICAgICAgICAgICAgICBwcml2YXRlIGF1dGhTZXJ2ZXJQcm92aWRlcjogQXV0aFNlcnZlclByb3ZpZGVyKSB7XG4gICAgICAgIHRoaXMucmVzb3VyY2VVcmwgPSBzZXJ2ZXJVcmwuU0VSVkVSX0FQSV9VUkwgKyAnL2FwaS9wYXRpZW50cyc7XG4gICAgICAgIHRoaXMucmVzb3VyY2VTZWFyY2hVcmwgPSBzZXJ2ZXJVcmwuU0VSVkVSX0FQSV9VUkwgKyAnL2FwaS9fc2VhcmNoL3BhdGllbnRzJztcbiAgICAgICAgdGhpcy5vdmNSZXNvdXJjZVVybCA9IHNlcnZlclVybC5TRVJWRVJfQVBJX1VSTCArICcvYXBpL292Y3MnO1xuICAgIH1cblxuICAgIGNyZWF0ZShkYXRhOiBQYXRpZW50KTogT2JzZXJ2YWJsZTxFbnRpdHlSZXNwb25zZVR5cGU+IHtcbiAgICAgICAgY29uc3QgcGF0aWVudCA9IHRoaXMuY29udmVydERhdGVGcm9tQ2xpZW50KGRhdGEpO1xuICAgICAgICByZXR1cm4gdGhpcy5odHRwXG4gICAgICAgICAgICAucG9zdDxQYXRpZW50Pih0aGlzLnJlc291cmNlVXJsLCBwYXRpZW50LCB7b2JzZXJ2ZTogJ3Jlc3BvbnNlJ30pXG4gICAgICAgICAgICAucGlwZShtYXAoKHJlczogRW50aXR5UmVzcG9uc2VUeXBlKSA9PiB0aGlzLmNvbnZlcnREYXRlRnJvbVNlcnZlcihyZXMpKSk7XG4gICAgfVxuXG4gICAgdXBkYXRlKGRhdGE6IFBhdGllbnQpOiBPYnNlcnZhYmxlPEVudGl0eVJlc3BvbnNlVHlwZT4ge1xuICAgICAgICBjb25zdCBwYXRpZW50ID0gdGhpcy5jb252ZXJ0RGF0ZUZyb21DbGllbnQoZGF0YSk7XG4gICAgICAgIHJldHVybiB0aGlzLmh0dHBcbiAgICAgICAgICAgIC5wdXQ8UGF0aWVudD4odGhpcy5yZXNvdXJjZVVybCwgcGF0aWVudCwge29ic2VydmU6ICdyZXNwb25zZSd9KVxuICAgICAgICAgICAgLnBpcGUobWFwKChyZXM6IEVudGl0eVJlc3BvbnNlVHlwZSkgPT4gdGhpcy5jb252ZXJ0RGF0ZUZyb21TZXJ2ZXIocmVzKSksXG4gICAgICAgICAgICAgICAgc2hhcmUoKSk7XG4gICAgfVxuXG4gICAgZmluZChpZDogYW55KTogT2JzZXJ2YWJsZTxFbnRpdHlSZXNwb25zZVR5cGU+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaHR0cFxuICAgICAgICAgICAgLmdldDxQYXRpZW50PihgJHt0aGlzLnJlc291cmNlVXJsfS8ke2lkfWAsIHtvYnNlcnZlOiAncmVzcG9uc2UnfSlcbiAgICAgICAgICAgIC5waXBlKG1hcCgocmVzOiBFbnRpdHlSZXNwb25zZVR5cGUpID0+IHRoaXMuY29udmVydERhdGVGcm9tU2VydmVyKHJlcykpKTtcbiAgICB9XG5cbiAgICBmaW5kQnlVdWlkKGlkOiBhbnkpOiBPYnNlcnZhYmxlPEVudGl0eVJlc3BvbnNlVHlwZT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5odHRwXG4gICAgICAgICAgICAuZ2V0PFBhdGllbnQ+KGAke3RoaXMucmVzb3VyY2VVcmx9L2J5LXV1aWQvJHtpZH1gLCB7b2JzZXJ2ZTogJ3Jlc3BvbnNlJ30pXG4gICAgICAgICAgICAucGlwZShtYXAoKHJlczogRW50aXR5UmVzcG9uc2VUeXBlKSA9PiB0aGlzLmNvbnZlcnREYXRlRnJvbVNlcnZlcihyZXMpKSk7XG4gICAgfVxuXG4gICAgcXVlcnkocmVxPzogYW55KTogT2JzZXJ2YWJsZTxFbnRpdHlBcnJheVJlc3BvbnNlVHlwZT4ge1xuICAgICAgICBjb25zdCBvcHRpb25zID0gY3JlYXRlUmVxdWVzdE9wdGlvbihyZXEpO1xuICAgICAgICByZXR1cm4gdGhpcy5odHRwXG4gICAgICAgICAgICAuZ2V0PFBhdGllbnRbXT4odGhpcy5yZXNvdXJjZVVybCwge3BhcmFtczogb3B0aW9ucywgb2JzZXJ2ZTogJ3Jlc3BvbnNlJ30pXG4gICAgICAgICAgICAucGlwZShtYXAoKHJlczogRW50aXR5QXJyYXlSZXNwb25zZVR5cGUpID0+IHRoaXMuY29udmVydERhdGVBcnJheUZyb21TZXJ2ZXIocmVzKSkpO1xuICAgIH1cblxuICAgIGRlbGV0ZShpZDogbnVtYmVyKTogT2JzZXJ2YWJsZTxIdHRwUmVzcG9uc2U8YW55Pj4ge1xuICAgICAgICByZXR1cm4gdGhpcy5odHRwLmRlbGV0ZTxhbnk+KGAke3RoaXMucmVzb3VyY2VVcmx9LyR7aWR9YCwge29ic2VydmU6ICdyZXNwb25zZSd9KTtcbiAgICB9XG5cbiAgICBnZXRPVkNCeVBhdGllbnQoaWQ6IG51bWJlcikge1xuICAgICAgICByZXR1cm4gdGhpcy5odHRwLmdldDxPVkM+KGAke3RoaXMub3ZjUmVzb3VyY2VVcmx9L3BhdGllbnQvJHtpZH1gKVxuICAgIH1cblxuICAgIHdpZGdldHMocGF0aWVudElkOiBudW1iZXIpOiBPYnNlcnZhYmxlPFBhdGllbnRXaWRnZXRbXT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5odHRwLmdldDxQYXRpZW50V2lkZ2V0W10+KGAke3RoaXMucmVzb3VyY2VVcmx9LyR7cGF0aWVudElkfS93aWRnZXRzYCwge29ic2VydmU6ICdib2R5J30pXG4gICAgfVxuXG4gICAgb2JzZXJ2YXRpb25zKHBhdGllbnRJZDogbnVtYmVyKTogT2JzZXJ2YWJsZTxQYXRpZW50T2JzZXJ2YXRpb25bXT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5odHRwLmdldDxQYXRpZW50T2JzZXJ2YXRpb25bXT4oYCR7dGhpcy5yZXNvdXJjZVVybH0vJHtwYXRpZW50SWR9L29ic2VydmF0aW9uc2AsIHtcbiAgICAgICAgICAgIG9ic2VydmU6ICdib2R5J1xuICAgICAgICB9KVxuICAgIH1cblxuICAgIGFjdGl2aXRpZXMocGF0aWVudElkOiBudW1iZXIsIGRldGFpbGVkOiBib29sZWFuKTogT2JzZXJ2YWJsZTxQYXRpZW50VGltZWxpbmVbXT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5odHRwLmdldDxQYXRpZW50VGltZWxpbmVbXT4oYCR7dGhpcy5yZXNvdXJjZVVybH0vJHtwYXRpZW50SWR9L2FjdGl2aXRpZXM/ZnVsbD0ke2RldGFpbGVkfWAsIHtvYnNlcnZlOiAnYm9keSd9KVxuICAgICAgICAgICAgLnBpcGUobWFwKHJlcyA9PiB7XG4gICAgICAgICAgICAgICAgcmVzLnNvcnQoKHQxLCB0MikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBkMSA9IG1vbWVudCh0MS5kYXRlLCAnREQgTU1NLCBZWVlZJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGQyID0gbW9tZW50KHQyLmRhdGUsICdERCBNTU0sIFlZWVknKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGQyLmRpZmYoZDEpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgICAgICB9KSlcbiAgICB9XG5cbiAgICBnZXRBY3RpdmVGYWNpbGl0eSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaHR0cC5nZXQ8RmFjaWxpdHk+KCcvYXBpL2ZhY2lsaXRpZXMvYWN0aXZlJylcbiAgICB9XG5cbiAgICBnZXRBbGxGYWNpbGl0eSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaHR0cC5nZXQ8RmFjaWxpdHlbXT4oJy9hcGkvZmFjaWxpdGllcycpXG4gICAgfVxuXG4gICAgZ2V0U3RhdGVzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5odHRwLmdldDxhbnlbXT4oJy9hcGkvc3RhdGVzJylcbiAgICB9XG5cbiAgICBnZXRMZ2FzQnlTdGF0ZShpZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5odHRwLmdldDxhbnlbXT4oYC9hcGkvcHJvdmluY2VzL3N0YXRlLyR7aWR9YClcbiAgICB9XG5cbiAgICBnZXRTdGF0ZUJ5TGdhKGlkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmh0dHAuZ2V0KGAvYXBpL3Byb3ZpbmNlcy8ke2lkfS9zdGF0ZWApXG4gICAgfVxuXG4gICAgZ2V0RmFjaWxpdHkoaWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaHR0cC5nZXQoYC9hcGkvZmFjaWxpdGllcy8ke2lkfWApXG4gICAgfVxuXG4gICAgZXhpc3RzQnlIb3NwaXRhbE51bWJlcihob3NwaXRhbE51bTogc3RyaW5nKTogT2JzZXJ2YWJsZTxWYWxpZGF0aW9uRXJyb3JzIHwgbnVsbD4ge1xuICAgICAgICByZXR1cm4gdGhpcy5odHRwLnBvc3Q8Ym9vbGVhbj4oYCR7dGhpcy5yZXNvdXJjZVVybH0vZXhpc3RzL2hvc3BpdGFsLW51bWJlcmAsIHtudW1iZXI6IGhvc3BpdGFsTnVtfSlcbiAgICAgICAgICAgIC5waXBlKG1hcCgocmVzID0+IHJlcyA/IHsnbnVtYmVyRXhpc3RzJzogdHJ1ZX0gOiBudWxsKSkpO1xuICAgIH1cblxuICAgIGdldFN0YXR1c0RhdGVzQnlQYXRpZW50KHBhdGllbnRJZDogbnVtYmVyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmh0dHAuZ2V0PE1vbWVudFtdPihgL2FwaS9jbGllbnQtc3RhdHVzZXMvcGF0aWVudC8ke3BhdGllbnRJZH0vc3RhdHVzLWRhdGVzYClcbiAgICAgICAgICAgIC5waXBlKG1hcCgocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlcy5mb3JFYWNoKGQgPT4gbW9tZW50KGQpKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKVxuICAgIH1cblxuICAgIGdldFN1bW1hcnlGb3JQYXRpZW50KGlkOiBudW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaHR0cC5nZXQ8U3VtbWFyeVtdPihgJHt0aGlzLnJlc291cmNlVXJsfS8ke2lkfS9zdW1tYXJ5YClcbiAgICB9XG5cbiAgICBzYXZlQ2xpZW50U3RhdHVzKHN0YXR1czogU3RhdHVzSGlzdG9yeSkge1xuICAgICAgICBjb25zb2xlLmxvZygnU3RhdHVzJywgc3RhdHVzKTtcbiAgICAgICAgY29uc3QgY29weSA9IFBhdGllbnRTZXJ2aWNlLmNvbnZlcnRTdGF0dXNGcm9tQ2xpZW50KHN0YXR1cyk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdDb3B5JywgY29weSk7XG4gICAgICAgIHJldHVybiB0aGlzLmh0dHAucG9zdDxTdGF0dXNIaXN0b3J5PignL2FwaS9jbGllbnQtc3RhdHVzZXMnLCBjb3B5LCB7b2JzZXJ2ZTogJ3Jlc3BvbnNlJ30pXG4gICAgfVxuXG4gICAgdXBkYXRlQ2xpZW50U3RhdHVzKHN0YXR1czogU3RhdHVzSGlzdG9yeSkge1xuICAgICAgICBjb25zdCBjb3B5ID0gUGF0aWVudFNlcnZpY2UuY29udmVydFN0YXR1c0Zyb21DbGllbnQoc3RhdHVzKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuaHR0cC5wdXQ8U3RhdHVzSGlzdG9yeT4oJy9hcGkvY2xpZW50LXN0YXR1c2VzJywgY29weSwge29ic2VydmU6ICdyZXNwb25zZSd9KVxuICAgIH1cblxuICAgIGZpbmRDbGllbnRTdGF0dXMoaWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaHR0cC5nZXQ8U3RhdHVzSGlzdG9yeT4oYC9hcGkvY2xpZW50LXN0YXR1c2VzL2J5LXV1aWQvJHtpZH1gLCB7b2JzZXJ2ZTogJ3Jlc3BvbnNlJ30pXG4gICAgICAgICAgICAucGlwZShtYXAoKHJlczogSHR0cFJlc3BvbnNlPFN0YXR1c0hpc3Rvcnk+KSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzLmJvZHkuZGF0ZVRyYWNrZWQgPSByZXMuYm9keS5kYXRlVHJhY2tlZCAhPSBudWxsID8gbW9tZW50KHJlcy5ib2R5LmRhdGVUcmFja2VkKSA6IG51bGw7XG4gICAgICAgICAgICAgICAgcmVzLmJvZHkuZGF0ZVN0YXR1cyA9IHJlcy5ib2R5LmRhdGVTdGF0dXMgIT0gbnVsbCA/IG1vbWVudChyZXMuYm9keS5kYXRlU3RhdHVzKSA6IG51bGw7XG4gICAgICAgICAgICAgICAgcmVzLmJvZHkuYWdyZWVkRGF0ZSA9IHJlcy5ib2R5LmFncmVlZERhdGUgIT0gbnVsbCA/IG1vbWVudChyZXMuYm9keS5hZ3JlZWREYXRlKSA6IG51bGw7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgICAgIH0pKVxuICAgIH1cblxuICAgIGN1cnJlbnRDbGllbnRTdGF0dXMocGF0aWVudElkOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaHR0cC5nZXQoYC9hcGkvY2xpZW50LXN0YXR1c2VzL3BhdGllbnQvJHtwYXRpZW50SWR9L2N1cnJlbnRgLCB7cmVzcG9uc2VUeXBlOiAndGV4dCd9KVxuICAgIH1cblxuICAgIGdldFN0YXR1c05hbWUoaWQ6IG51bWJlcikge1xuICAgICAgICByZXR1cm4gdGhpcy5odHRwLmdldChgL2FwaS9jbGllbnQtc3RhdHVzZXMvJHtpZH0vbmFtZWAsIHtyZXNwb25zZVR5cGU6ICd0ZXh0J30pXG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgY29udmVydFN0YXR1c0Zyb21DbGllbnQoc3RhdHVzOiBTdGF0dXNIaXN0b3J5KTogU3RhdHVzSGlzdG9yeSB7XG4gICAgICAgIGNvbnN0IGNvcHk6IFN0YXR1c0hpc3RvcnkgPSBPYmplY3QuYXNzaWduKHt9LCBzdGF0dXMsIHtcbiAgICAgICAgICAgICAgICBkYXRlU3RhdHVzOiBzdGF0dXMuZGF0ZVN0YXR1cyAhPSBudWxsICYmIHN0YXR1cy5kYXRlU3RhdHVzLmlzVmFsaWQoKSA/IHN0YXR1cy5kYXRlU3RhdHVzLmZvcm1hdChEQVRFX0ZPUk1BVCkgOiBudWxsLFxuICAgICAgICAgICAgICAgIGFncmVlZERhdGU6IHN0YXR1cy5hZ3JlZWREYXRlICE9IG51bGwgJiYgc3RhdHVzLmFncmVlZERhdGUuaXNWYWxpZCgpID8gc3RhdHVzLmFncmVlZERhdGUuZm9ybWF0KERBVEVfRk9STUFUKSA6IG51bGwsXG4gICAgICAgICAgICAgICAgZGF0ZVRyYWNrZWQ6IHN0YXR1cy5kYXRlVHJhY2tlZCAhPSBudWxsICYmIHN0YXR1cy5kYXRlVHJhY2tlZC5pc1ZhbGlkKCkgPyBzdGF0dXMuZGF0ZVRyYWNrZWQuZm9ybWF0KERBVEVfRk9STUFUKSA6IG51bGwsXG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiBjb3B5O1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBjb252ZXJ0RGF0ZUZyb21DbGllbnQocGF0aWVudDogUGF0aWVudCk6IFBhdGllbnQge1xuICAgICAgICBjb25zdCBjb3B5OiBQYXRpZW50ID0gT2JqZWN0LmFzc2lnbih7fSwgcGF0aWVudCwge1xuICAgICAgICAgICAgZGF0ZUJpcnRoOiBwYXRpZW50LmRhdGVCaXJ0aCAhPSBudWxsICYmIHBhdGllbnQuZGF0ZUJpcnRoLmlzVmFsaWQoKSA/IHBhdGllbnQuZGF0ZUJpcnRoLmZvcm1hdChEQVRFX0ZPUk1BVCkgOiBudWxsLFxuICAgICAgICAgICAgZGF0ZVJlZ2lzdHJhdGlvbjogcGF0aWVudC5kYXRlUmVnaXN0cmF0aW9uICE9IG51bGwgJiYgcGF0aWVudC5kYXRlUmVnaXN0cmF0aW9uLmlzVmFsaWQoKSA/IHBhdGllbnQuZGF0ZVJlZ2lzdHJhdGlvbi5mb3JtYXQoREFURV9GT1JNQVQpIDogbnVsbCxcbiAgICAgICAgICAgIGRhdGVTdGFydGVkOiBwYXRpZW50LmRhdGVTdGFydGVkICE9IG51bGwgJiYgcGF0aWVudC5kYXRlU3RhcnRlZC5pc1ZhbGlkKCkgPyBwYXRpZW50LmRhdGVTdGFydGVkLmZvcm1hdChEQVRFX0ZPUk1BVCkgOiBudWxsLFxuICAgICAgICAgICAgZGF0ZUNvbmZpcm1lZEhpdjogcGF0aWVudC5kYXRlQ29uZmlybWVkSGl2ICE9IG51bGwgJiYgcGF0aWVudC5kYXRlQ29uZmlybWVkSGl2LmlzVmFsaWQoKSA/IHBhdGllbnQuZGF0ZUNvbmZpcm1lZEhpdi5mb3JtYXQoREFURV9GT1JNQVQpIDogbnVsbCxcbiAgICAgICAgICAgIGRhdGVFbnJvbGxlZFBNVENUOiBwYXRpZW50LmRhdGVFbnJvbGxlZFBNVENUICE9IG51bGwgJiYgcGF0aWVudC5kYXRlRW5yb2xsZWRQTVRDVC5pc1ZhbGlkKCkgPyBwYXRpZW50LmRhdGVFbnJvbGxlZFBNVENULmZvcm1hdChEQVRFX0ZPUk1BVCkgOiBudWxsLFxuICAgICAgICAgICAgcHJlZ25hbnQ6IHBhdGllbnQucHJlZ25hbmN5U3RhdHVzID09PSAyLFxuICAgICAgICAgICAgYnJlYXN0ZmVlZGluZzogcGF0aWVudC5wcmVnbmFuY3lTdGF0dXMgPT09IDNcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBjb3B5O1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBjb252ZXJ0RGF0ZUZyb21TZXJ2ZXIocmVzOiBFbnRpdHlSZXNwb25zZVR5cGUpOiBFbnRpdHlSZXNwb25zZVR5cGUge1xuICAgICAgICBpZiAocmVzLmJvZHkpIHtcbiAgICAgICAgICAgIHJlcy5ib2R5Lm5hbWUgPSByZXMuYm9keS5zdXJuYW1lICsgJywgJyArIHJlcy5ib2R5Lm90aGVyTmFtZXM7XG4gICAgICAgICAgICByZXMuYm9keS5kYXRlQmlydGggPSByZXMuYm9keS5kYXRlQmlydGggIT0gbnVsbCA/IG1vbWVudChyZXMuYm9keS5kYXRlQmlydGgpIDogbnVsbDtcbiAgICAgICAgICAgIHJlcy5ib2R5LmRhdGVSZWdpc3RyYXRpb24gPSByZXMuYm9keS5kYXRlUmVnaXN0cmF0aW9uICE9IG51bGwgPyBtb21lbnQocmVzLmJvZHkuZGF0ZVJlZ2lzdHJhdGlvbikgOiBudWxsO1xuICAgICAgICAgICAgcmVzLmJvZHkuZGF0ZUNvbmZpcm1lZEhpdiA9IHJlcy5ib2R5LmRhdGVDb25maXJtZWRIaXYgIT0gbnVsbCA/IG1vbWVudChyZXMuYm9keS5kYXRlQ29uZmlybWVkSGl2KSA6IG51bGw7XG4gICAgICAgICAgICByZXMuYm9keS5kYXRlRW5yb2xsZWRQTVRDVCA9IHJlcy5ib2R5LmRhdGVFbnJvbGxlZFBNVENUICE9IG51bGwgPyBtb21lbnQocmVzLmJvZHkuZGF0ZUVucm9sbGVkUE1UQ1QpIDogbnVsbDtcbiAgICAgICAgICAgIHJlcy5ib2R5LmRhdGVTdGFydGVkID0gcmVzLmJvZHkuZGF0ZVN0YXJ0ZWQgIT0gbnVsbCA/IG1vbWVudChyZXMuYm9keS5kYXRlU3RhcnRlZCkgOiBudWxsO1xuICAgICAgICAgICAgcmVzLmJvZHkucHJlZ25hbmN5U3RhdHVzID0gcmVzLmJvZHkucHJlZ25hbnQgIT0gbnVsbCAmJiByZXMuYm9keS5wcmVnbmFudCA/IDIgOiByZXMuYm9keS5nZW5kZXIgPT09ICdGRU1BTEUnID8gMSA6IG51bGw7XG4gICAgICAgICAgICByZXMuYm9keS5wcmVnbmFuY3lTdGF0dXMgPSByZXMuYm9keS5icmVhc3RmZWVkaW5nICE9IG51bGwgJiYgcmVzLmJvZHkuYnJlYXN0ZmVlZGluZyA/IDMgOiByZXMuYm9keS5nZW5kZXIgPT09ICdGRU1BTEUnID8gMSA6IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgY29udmVydERhdGVBcnJheUZyb21TZXJ2ZXIocmVzOiBFbnRpdHlBcnJheVJlc3BvbnNlVHlwZSk6IEVudGl0eUFycmF5UmVzcG9uc2VUeXBlIHtcbiAgICAgICAgaWYgKHJlcy5ib2R5KSB7XG4gICAgICAgICAgICByZXMuYm9keS5mb3JFYWNoKChwYXRpZW50OiBQYXRpZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgcGF0aWVudC5uYW1lID0gcGF0aWVudC5zdXJuYW1lICsgJywgJyArIHBhdGllbnQub3RoZXJOYW1lcztcbiAgICAgICAgICAgICAgICBwYXRpZW50LmRhdGVCaXJ0aCA9IHBhdGllbnQuZGF0ZUJpcnRoICE9IG51bGwgPyBtb21lbnQocGF0aWVudC5kYXRlQmlydGgpIDogbnVsbDtcbiAgICAgICAgICAgICAgICBwYXRpZW50LmRhdGVSZWdpc3RyYXRpb24gPSBwYXRpZW50LmRhdGVSZWdpc3RyYXRpb24gIT0gbnVsbCA/IG1vbWVudChwYXRpZW50LmRhdGVSZWdpc3RyYXRpb24pIDogbnVsbDtcbiAgICAgICAgICAgICAgICBwYXRpZW50LmRhdGVTdGFydGVkID0gcGF0aWVudC5kYXRlU3RhcnRlZCAhPSBudWxsID8gbW9tZW50KHBhdGllbnQuZGF0ZVN0YXJ0ZWQpIDogbnVsbDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfVxufVxuIl19
