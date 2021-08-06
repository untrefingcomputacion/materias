import { mapObject, correlatividades } from './utils';

const resetearEstilos = () => {
    document.querySelectorAll('.materia, .flecha').forEach(el => el.classList.remove('aprobada', 'regularizada', 'flecha-punta-regularizada', 'flecha-cuerpo-regularizada', 'regularizable', 'flecha-punta-regularizable', 'flecha-cuerpo-regularizable', 'aprobable', 'flecha-punta-aprobable', 'flecha-cuerpo-aprobable'));
}

const estilizarAprobada = (key: string) => {
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

const checkRegularizable = (materia, listadoMaterias) => {
    return (materia.instancia === null || materia.instancia === 'En Curso') && materia.correlativas.every(correlativa => ['Equivalencia', 'Regularidad', 'Examen'].includes(listadoMaterias[correlativa].instancia)) && materia.correlativas.some(correlativa => listadoMaterias[correlativa].instancia === 'Regularidad');
}

const checkAprobable = (materia, listadoMaterias) => {
    return  materia.instancia !== 'Examen' && materia.instancia !== 'Equivalencia' && (materia.correlativas === [] || materia.correlativas.every(correlativa => ['Equivalencia', 'Examen'].includes(listadoMaterias[correlativa].instancia)));
}

const mapCursadasYFinales = (materia, _key, { listadoMaterias }) => {
    const regularizable = checkRegularizable(materia, listadoMaterias);
    const aprobable = checkAprobable(materia, listadoMaterias);
    const regularizada = materia.instancia === 'Regularidad';
    const aprobada = materia.instancia === 'Examen' || materia.instancia === 'Equivalencia';

    return { ...materia, regularizable, aprobable, regularizada, aprobada };
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
                regularizables[key] = element;
            }
            if (element.aprobable) {
                aprobables[key] = element;
            }
            if (element.regularizada) {
                regularizadas[key] = element;
            }
            if (element.aprobada) {
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

const estilizar = (materias, funcEstilo) => {
    for (const key in materias) {
        if (Object.hasOwnProperty.call(materias, key)) {
            funcEstilo(key);
        }
    }
}

const estilizarMaterias = materiasAgrupadas => {
    estilizar(materiasAgrupadas.regularizables, estilizarRegularizable);
    estilizar(materiasAgrupadas.regularizadas, estilizarRegularizada);
    estilizar(materiasAgrupadas.aprobables, estilizarAprobable);
    estilizar(materiasAgrupadas.aprobadas, estilizarAprobada);
}

const calcular = () => {
    resetearEstilos();
    const datosSIU = document.getElementById("datosSIU").value;

    const listaRaw = datosSIU.split('\n');
    const materiasRaw = listaRaw.filter(linea => linea.includes('\tMateria'));

    const materiasYCorrelativas = mapObject(materiasRaw.reduce(mapMateria, {}), mapCorrelativas);
    const materias = mapObject(materiasYCorrelativas, mapCursadasYFinales, { listadoMaterias: materiasYCorrelativas });
    const materiasAgrupadas = agruparMaterias(materias);
    estilizarMaterias(materiasAgrupadas);
}

document.getElementById("calcular").addEventListener("click", calcular, false);