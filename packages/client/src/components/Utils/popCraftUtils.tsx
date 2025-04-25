
import { MODE_SCORE_CHAL_SUCCESS_SCORE } from "../../constant"

export function checkIsSuccess({
    gameModeData,
    TCMPopStarData,
    rankingRecordData,
  }: {
    gameModeData: any;
    TCMPopStarData: { matrixArray: bigint[] };
    rankingRecordData: any;
  }): boolean {
    if (gameModeData && gameModeData.mode === 1n) {
      return rankingRecordData && (rankingRecordData.latestScores as bigint) >= MODE_SCORE_CHAL_SUCCESS_SCORE;
    } else {
      return checkClearBoard(TCMPopStarData.matrixArray);
    }
  }

export function checkClearBoard(matrixArray: bigint[]): boolean {
    return matrixArray.every((data: bigint) => data === 0n);
}
  