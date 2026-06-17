import { Cliente } from './Cliente.js';
import { TARIFAS } from '../constants/tarifas.js';

class Estudante extends Cliente {
    constructor(cpf, nome) {
        super(cpf, nome);
        this.saldo = 0;
    }

    adicionarPlaca(placa) {
        if (this.placas.size < 1) { // Apenas uma placa permitida
            super.adicionarPlaca(placa);
        } else {
            throw new Error("Estudante pode cadastrar apenas uma placa.");
        }
    }

    podeEntrar(placa, registrosAtivos) {
        // Novas entradas bloqueadas se saldo negativo
        return this.saldo >= 0; 
    }

    calcularCusto(ticket) {
        const dias = ticket.calcularDiasEstacionados();
        // Custo fixo por ingresso no mesmo dia. Novo ingresso após meia-noite
        return (dias + 1) * TARIFAS.ESTUDANTE_INGRESSO; 
    }

    processarPagamento(valor) {
        this.saldo -= valor; // Permite saldo negativo na saída
    }
}

export { Estudante };