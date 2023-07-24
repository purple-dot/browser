import * as PurpleDot from '../../src/index';

declare global {
  interface Window {
    PurpleDot: typeof PurpleDot;
  }
}

window.PurpleDot = PurpleDot;
