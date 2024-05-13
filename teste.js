import { setTimeout } from 'node:timers/promises';


const startTime = performance.now();

// Realizando alguma operação que você deseja medir
await setTimeout(1000);

// Obtendo o tempo final
const endTime = performance.now();

// Calculando o delta em milissegundos
const deltaMilliseconds = endTime - startTime;

console.log('Delta em milissegundos:', deltaMilliseconds);

// Convertendo o delta para segundos
const deltaSeconds = deltaMilliseconds / 1000;

console.log('Delta em segundos:', deltaSeconds);