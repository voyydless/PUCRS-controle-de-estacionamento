import { Cliente } from './Cliente.js';
import { TARIFAS } from '../constants/tarifas.js';

class ClienteAvulso extends Cliente {
    constructor() {
        super("AVULSO", "Cliente Avulso");
    }

    podeEntrar(placa, listaBloqueio) {
        return !listaBloqueio.has(placa); // Impede futuras entradas se bloqueado
    }

    calcularCusto(ticket) {
        const horas = ticket.calcularHorasEstacionadas();
        const dias = ticket.calcularDiasEstacionados();

        let custo = 0;
        // Nova diária se passar da meia-noite, independente das horas do dia anterior
        if (dias > 0) {
            custo = (dias + 1) * TARIFAS.AVULSO_DIARIA; 
        } else if (horas <= 6) {
            custo = horas * TARIFAS.AVULSO_HORA; // Valor fixo por hora até 6 horas
        } else {
            custo = TARIFAS.AVULSO_DIARIA; // Tarifa de diária se passar de 6 horas no mesmo dia
        }
        return custo;
    }
}

export { ClienteAvulso };