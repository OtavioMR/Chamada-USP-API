export class Presenca {
    email: string;
    nomeAluno: string;
    numeroUSP: string;
    turma: string;
    materia: string;
    emailUSP: string;
    horario: string;
    latitude: number;
    longitude: number;

    constructor(email: string, nomeAluno: string, numeroUSP: string, turma: string, materia: string, emailUSP: string, horario: string, latitude: number, longitude: number){
        this.email = email;
        this.nomeAluno = nomeAluno;
        this.numeroUSP = numeroUSP;
        this.turma = turma;
        this.materia = materia;
        this.emailUSP = emailUSP;
        this.horario = horario;
        this.latitude = latitude;
        this.longitude = longitude;
    }
}