import { mapObject, correlatividades } from './utils.js';

const resetearEstilos = () => {
    document.querySelectorAll('.materia, .flecha').forEach(el => el.classList.remove('aprobada', 'regularizada', 'flecha-punta-regularizada', 'flecha-cuerpo-regularizada', 'regularizable', 'flecha-punta-regularizable', 'flecha-cuerpo-regularizable', 'aprobable', 'flecha-punta-aprobable', 'flecha-cuerpo-aprobable'));
}

const estilizarAprobada = key => {
    document.querySelectorAll(`.id-${key}`).forEach(el => el.classList.add('aprobada'));
}

const estilizarRegularizada = key => {
    document.querySelectorAll(`.materia.rectangulo.id-${key}`).forEach(el => el.classList.add('regularizada'));
    document.querySelectorAll(`.flecha.punta.id-${key}`).forEach(el => el.classList.add('flecha-punta-regularizada'));
    document.querySelectorAll(`.flecha.cuerpo.id-${key}`).forEach(el => el.classList.add('flecha-cuerpo-regularizada'));
}

const estilizarRegularizable = key => {
    document.querySelectorAll(`.materia.rectangulo.id-${key}`).forEach(el => el.classList.add('regularizable'));
    document.querySelectorAll(`.flecha.punta.id-${key}`).forEach(el => el.classList.add('flecha-punta-regularizable'));
    document.querySelectorAll(`.flecha.cuerpo.id-${key}`).forEach(el => el.classList.add('flecha-cuerpo-regularizable'));
}

const estilizarAprobable = key => {
    document.querySelectorAll(`.materia.rectangulo.id-${key}`).forEach(el => el.classList.add('aprobable'));
    document.querySelectorAll(`.flecha.punta.id-${key}`).forEach(el => el.classList.add('flecha-punta-aprobable'));
    document.querySelectorAll(`.flecha.cuerpo.id-${key}`).forEach(el => el.classList.add('flecha-cuerpo-aprobable'));
}

const mapMateria = (acum, materiaRaw) => {
    const [nombreIdRaw, _, anioRaw, cuatrimestreRaw, notaRaw, instanciaRaw] = materiaRaw.split('\t');
    const [nombreRaw, idRaw] = nombreIdRaw.split('(');
    const nombre = nombreRaw.trim()
    const id = idRaw.replace(')', '');
    const anio = parseInt(anioRaw);
    const cuatrimestre = parseInt(cuatrimestreRaw.substr(0, 1));
    const nota = notaRaw ? parseFloat(notaRaw.substr(0, 2)) : null;
    const instancia = instanciaRaw ? instanciaRaw : null;

    return {
        ...acum,
        [id]: {
            nombre,
            anio,
            cuatrimestre,
            nota,
            instancia
        },
    }
}


const mapCorrelativas = (materia, key) => {
    return { ...materia, correlativas: correlatividades[key] };
}

const mapCursadasYFinales = (materia, _key, { listadoMaterias }) => {
    const regularizable = materia.instancia === null && materia.correlativas.every(correlativa => ['Equivalencia', 'Regularidad', 'Examen'].includes(listadoMaterias[correlativa].instancia)) && materia.correlativas.some(correlativa => listadoMaterias[correlativa].instancia === 'Regularidad');
    const aprobable = materia.instancia !== 'Examen' && materia.instancia !== 'Equivalencia' && (materia.correlativas === [] || materia.correlativas.every(correlativa => ['Equivalencia', 'Examen'].includes(listadoMaterias[correlativa].instancia)));
    return { ...materia, regularizable, aprobable };
}

const agruparMaterias = materias => {
    const regularizables = {};
    const regularizadas = {};
    const aprobables = {};
    const aprobadas = {};

    for (const key in materias) {
        if (Object.hasOwnProperty.call(materias, key)) {
            const element = materias[key];
            if (element.regularizable) {
                estilizarRegularizable(key);
                regularizables[key] = element;
            }
            if (element.aprobable) {
                estilizarAprobable(key);
                aprobables[key] = element;
            }
            if (element.instancia === 'Regularidad') {
                estilizarRegularizada(key);
                regularizadas[key] = element;
            }
            if (element.instancia === 'Examen' || element.instancia === 'Equivalencia') {
                estilizarAprobada(key);
                aprobadas[key] = element;
            }
        }
    }
    return {
        regularizables,
        regularizadas,
        aprobables,
        aprobadas
    }
}

const calcular = () => {
    resetearEstilos();
    const datosSIU = document.getElementById("datosSIU").value;

    const listaRaw = datosSIU.split('\n');
    const materiasRaw = listaRaw.filter(linea => linea.includes('\tMateria'));

    const materiasYCorrelativas = mapObject(materiasRaw.reduce(mapMateria, {}), mapCorrelativas);
    const materias = mapObject(materiasYCorrelativas, mapCursadasYFinales, { listadoMaterias: materiasYCorrelativas });
    const materiasAgrupadas = agruparMaterias(materias);
    // document.getElementById("materias").innerText = `REGULARIZABLES: ${JSON.stringify(Object.keys(materiasAgrupadas.regularizables).map(k => materiasAgrupadas.regularizables[k].nombre), null, 2)}\r\n
    // APROBABLES: ${JSON.stringify(Object.keys(materiasAgrupadas.aprobables).map(k => materiasAgrupadas.aprobables[k].nombre), null, 2)}\r\n
    // REGULARIZADAS: ${JSON.stringify(Object.keys(materiasAgrupadas.regularizadas).map(k => materiasAgrupadas.regularizadas[k].nombre), null, 2)}\r\n
    // APROBADAS: ${JSON.stringify(Object.keys(materiasAgrupadas.aprobadas).map(k => materiasAgrupadas.aprobadas[k].nombre), null, 2)}`;
}

document.getElementById("calcular").addEventListener("click", calcular, false);