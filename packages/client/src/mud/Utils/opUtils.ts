

export function regenerateBottomRows(matrixArray: bigint[], regenerateMatrixArray: bigint[],): bigint[] {
    const regenerateMatrixArrayLength = regenerateMatrixArray.length;
    if(regenerateMatrixArray[regenerateMatrixArrayLength - 1] == 0n){
        return matrixArray;
    }
    let newValueIndex = findNewValueIndex(regenerateMatrixArray);
    if(newValueIndex == regenerateMatrixArrayLength){
        return matrixArray;
    }
    for (let index = 99; index >= 0; index--) {
        if(matrixArray[index] == 0n){
            if(newValueIndex == regenerateMatrixArrayLength || regenerateMatrixArray[newValueIndex] == 0n) break;
            matrixArray[index] = regenerateMatrixArray[newValueIndex];
            regenerateMatrixArray[newValueIndex] = 0n;
            newValueIndex++;
        }
    }
    return matrixArray;
}

const findNewValueIndex = (regenerateMatrixArray: bigint[]): number => {
    for (let index = 0; index < regenerateMatrixArray.length; index++) {
        if (regenerateMatrixArray[index] != 0n) {
            return index;
        }
    }
    return regenerateMatrixArray.length;
}

export function moveMatrixArray(matrixArray: bigint[]): bigint[] {
    let index: number;
    let zeroIndexRow: number;
    let zeroIndexColBot = 89;
    let zeroIndexCol: number;

    for (let i = 0; i < 10; i++) {
        zeroIndexRow = 90 + i;

        for (let j = 10; j > 0; j--) {
            index = i + (j - 1) * 10;

            if (matrixArray[index] !== 0n) {
                if (index !== zeroIndexRow) {
                    matrixArray[zeroIndexRow] = matrixArray[index];
                    matrixArray[index] = 0n;
                }
                zeroIndexRow -= 10;
            }
        }

        if (i > 0 && matrixArray[zeroIndexColBot] === 0n) {
            if (matrixArray[90 + i] !== 0n) {
                zeroIndexCol = zeroIndexColBot - 90;

                for (let x = 0; x < 10; x++) {
                    index = i + x * 10;
                    if (matrixArray[index] !== 0n) {
                        matrixArray[x * 10 + zeroIndexCol] = matrixArray[index];
                        matrixArray[index] = 0n;
                    }
                }
                zeroIndexColBot += 1;
            }
        } else {
            zeroIndexColBot += 1;
        }
    }

    return matrixArray;
}


export function dfsPopCraft(matrixIndex: number, targetValue: bigint, matrixArray: bigint[], eliminateAmount: number, popindexArr: number[]): [bigint[], number, number[]] {
    const x = matrixIndex % 10;
    const y = Math.floor(matrixIndex / 10);

    let index: number;

    // 检查左边
    if (x > 0) {
        index = matrixIndex - 1;
        if (matrixArray[index] === targetValue) {
            matrixArray[index] = 0n;
            eliminateAmount += 1;
            popindexArr.push(index);
            [matrixArray, eliminateAmount] = dfsPopCraft(index, targetValue, matrixArray, eliminateAmount, popindexArr);
        }
    }

    // 检查右边
    if (x < 9) {
        index = matrixIndex + 1;
        if (matrixArray[index] === targetValue) {
            matrixArray[index] = 0n;
            eliminateAmount += 1;
            popindexArr.push(index);
            [matrixArray, eliminateAmount] = dfsPopCraft(index, targetValue, matrixArray, eliminateAmount, popindexArr);
        }
    }

    // 检查上方
    if (y > 0) {
        index = matrixIndex - 10;
        if (matrixArray[index] === targetValue) {
            matrixArray[index] = 0n;
            eliminateAmount += 1;
            popindexArr.push(index);
            [matrixArray, eliminateAmount] = dfsPopCraft(index, targetValue, matrixArray, eliminateAmount, popindexArr);
        }
    }

    // 检查下方
    if (y < 9) {
        index = matrixIndex + 10;
        if (matrixArray[index] === targetValue) {
            matrixArray[index] = 0n;
            eliminateAmount += 1;
            popindexArr.push(index);
            [matrixArray, eliminateAmount] = dfsPopCraft(index, targetValue, matrixArray, eliminateAmount, popindexArr);
        }
    }

    return [matrixArray, eliminateAmount, popindexArr];
}

export function checkPopAccess(matrixIndex: number, targetValue: bigint, matrixArray: bigint[]): boolean {
    const x = matrixIndex % 10;
    const y = Math.floor(matrixIndex / 10);

    let index: number;

    // 检查左侧的元素
    if (x > 0) {
        index = matrixIndex - 1;
        if (matrixArray[index] === targetValue) {
            return true;
        }
    }

    // 检查右侧的元素
    if (x < 9) {
        index = matrixIndex + 1;
        if (matrixArray[index] === targetValue) {
            return true;
        }
    }

    // 检查上方的元素
    if (y > 0) {
        index = matrixIndex - 10;
        if (matrixArray[index] === targetValue) {
            return true;
        }
    }

    // 检查下方的元素
    if (y < 9) {
        index = matrixIndex + 10;
        if (matrixArray[index] === targetValue) {
            return true;
        }
    }

    return false;
}
