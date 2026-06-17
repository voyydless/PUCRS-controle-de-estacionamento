import { Cliente } from './Cliente.js';
import { TARIFAS } from '../constants/tarifas.js';

class Empresa extends Cliente {
    constructor(cnpj, nome) {
        super(cnpj, nome);
        this.inadimplente = false;
        this.debitoAcumulado = 0; // Débitos acumulados no cadastro
    }

    podeEntrar(placa, registrosAtivos) {
        // Todos podem estacionar simultaneamente, a menos que inadimplente
        return !this.inadimplente; 
    }

    calcularCusto(ticket) {
        const dias = ticket.calcularDiasEstacionados();
        let custo = (dias + 1) * TARIFAS.EMPRESA_DIARIA; // Cobrança por diária
        
        // Multa se pernoitar
        if (dias > 0) {
            custo += dias * TARIFAS.EMPRESA_MULTA_PERNOITE;
        }
        return custo;
    }
}

export { Empresa };