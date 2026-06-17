import { Cliente } from './Cliente.js';

class Professor extends Cliente {
    constructor(cpf, nome) {
        super(cpf, nome);
        this.limitePlacas = 2; // Até dois veículos vinculados
    }

    adicionarPlaca(placa) {
        if (this.placas.size < this.limitePlacas) {
            super.adicionarPlaca(placa);
        } else {
            throw new Error("Limite de placas para Professor atingido.");
        }
    }

    podeEntrar(placa, registrosAtivos) {
        // Apenas um veículo por professor simultaneamente
        const veiculosEstacionados = registrosAtivos.filter(t => this.placas.has(t.placa) && !t.dataSaida);
        return veiculosEstacionados.length === 0; // Se houver um, entrada negada
    }

    calcularCusto(ticket) {
        return 0; // A entrada no estacionamento é gratuita para professores
    }
}

export { Professor };