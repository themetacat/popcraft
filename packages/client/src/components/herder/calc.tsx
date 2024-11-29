import { getComponentValue } from "@latticexyz/recs";
import { encodeEntity } from "@latticexyz/store-sync/recs";

export function opRendering(positionX: number, positionY: number, playerAddr: any, TCMPopStar: any, StarToScore: any) {
    let eliminateAmount = 0;

    const playerEntity = encodeEntity({ address: "address" }, { address: playerAddr });

    const tcmPopStarData = getComponentValue(TCMPopStar, playerEntity);
    if (!tcmPopStarData) {
      console.error("game data is null");
      return [undefined, undefined];
    }
    const newTcmPopStarData = {
      ...tcmPopStarData,
      matrixArray: [...tcmPopStarData.matrixArray as bigint[]]
    };

    const matrixIndex = (positionX - Number(tcmPopStarData.x)) + (positionY - Number(tcmPopStarData.y)) * 10;
    const matrixArray = newTcmPopStarData.matrixArray as bigint[];
    const targetValue = matrixArray[matrixIndex];
    if (targetValue == 0n) {
      throw new Error("Blank area cannot be clicked");
    }

    const popAccess: boolean = checkPopAccess(matrixIndex, targetValue, matrixArray);
    if (!popAccess) {
      eliminateAmount = 1;
    } else {
      const [updatedMatrixArray, finalEliminateAmount] = dfsPopCraft(matrixIndex, targetValue, matrixArray, 0);
      eliminateAmount = finalEliminateAmount;
    }

    const score = getStartToScore(eliminateAmount, StarToScore);

    return score;
  }

  function checkPopAccess(matrixIndex: number, targetValue: bigint, matrixArray: bigint[]): boolean {
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

  function getStartToScore(eliminateAmount: number, StarToScore: any) {
    let resultScore = 0n;
    if (eliminateAmount > 101) {
      return resultScore;
    }
    if (eliminateAmount < 5 || eliminateAmount === 101) {
      const satrRecord = getComponentValue(
        StarToScore,
        encodeEntity({ num: "uint256" }, { num: BigInt(eliminateAmount) })
      );
      if (satrRecord) {
        resultScore = satrRecord.score as bigint;
      }
    } else {
      const satrRecord5 = getComponentValue(
        StarToScore,
        encodeEntity({ num: "uint256" }, { num: BigInt(5) })
      );
      if (satrRecord5) {
        resultScore += satrRecord5.score as bigint;
      }
      const satrRecordMore = getComponentValue(
        StarToScore,
        encodeEntity({ num: "uint256" }, { num: BigInt(0) })
      );
      if (satrRecordMore) {
        resultScore += satrRecordMore.score as bigint * BigInt(eliminateAmount - 5);
      }
    }
    return resultScore;
  }

  function dfsPopCraft(matrixIndex: number, targetValue: bigint, matrixArray: bigint[], eliminateAmount: number): [bigint[], number] {
    const x = matrixIndex % 10;
    const y = Math.floor(matrixIndex / 10);

    let index: number;

    // 检查左边
    if (x > 0) {
      index = matrixIndex - 1;
      if (matrixArray[index] === targetValue) {
        matrixArray[index] = 0n;
        eliminateAmount += 1;
        [matrixArray, eliminateAmount] = dfsPopCraft(index, targetValue, matrixArray, eliminateAmount);
      }
    }

    // 检查右边
    if (x < 9) {
      index = matrixIndex + 1;
      if (matrixArray[index] === targetValue) {
        matrixArray[index] = 0n;
        eliminateAmount += 1;
        [matrixArray, eliminateAmount] = dfsPopCraft(index, targetValue, matrixArray, eliminateAmount);
      }
    }

    // 检查上方
    if (y > 0) {
      index = matrixIndex - 10;
      if (matrixArray[index] === targetValue) {
        matrixArray[index] = 0n;
        eliminateAmount += 1;
        [matrixArray, eliminateAmount] = dfsPopCraft(index, targetValue, matrixArray, eliminateAmount);
      }
    }

    // 检查下方
    if (y < 9) {
      index = matrixIndex + 10;
      if (matrixArray[index] === targetValue) {
        matrixArray[index] = 0n;
        eliminateAmount += 1;
        [matrixArray, eliminateAmount] = dfsPopCraft(index, targetValue, matrixArray, eliminateAmount);
      }
    }

    return [matrixArray, eliminateAmount];
  }

  function moveMatrixArray(matrixArray: bigint[]): bigint[] {
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