import { EventEmitter } from 'events';

// This is a simple event emitter to decouple error handling.
export const errorEmitter = new EventEmitter();
