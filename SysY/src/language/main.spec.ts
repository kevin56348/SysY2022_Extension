import { test,  } from 'vitest'; // expect
import { getAstModel } from './ASTTest.js';

// const doc = `
// int y = 0;
// int k;
// int s[1][2];

// const int yyyy=0;

// int func1(int yy){
//     return yy+1;
// }

// int main(){
//     func1(y + s[0][0]);

//     return 0;
// }

// `;

test(
    'init', () => { 
        getAstModel();
    }
);