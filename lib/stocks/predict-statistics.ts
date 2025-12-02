// Statistical Prediction Utilities
// Note: This file uses xgboost_node which may not be available
// Keeping the structure for future integration

import type { XGBoostParams, TrainModelsOptions, PredictOptions } from './types';

/**
 * Calculate rolling statistics for a given array of values
 */
export function calculateRollingStats(
    data: any[],
    field: string,
    window: number = 7
): any[] {
    return data.map((item, index) => {
        if (index < window - 1) {
            return {
                ...item,
                [`${field}_rolling_mean_${window}d`]: item[field],
                [`${field}_rolling_std_${window}d`]: item[field]
            };
        }

        const windowValues = data
            .slice(index - window + 1, index + 1)
            .map(d => d[field])
            .filter(val => val !== null && val !== undefined && !isNaN(val));

        if (windowValues.length === 0) {
            return {
                ...item,
                [`${field}_rolling_mean_${window}d`]: null,
                [`${field}_rolling_std_${window}d`]: null
            };
        }

        const mean = windowValues.reduce((sum, val) => sum + val, 0) / windowValues.length;
        const variance =
            windowValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / windowValues.length;
        const std = Math.sqrt(variance);

        return {
            ...item,
            [`${field}_rolling_mean_${window}d`]: Math.floor(mean),
            [`${field}_rolling_std_${window}d`]: Math.floor(std)
        };
    });
}

/**
 * Calculate R-squared (coefficient of determination)
 */
export function calculateR2(predicted: number[], actual: number[]): number {
    const meanActual = actual.reduce((sum, val) => sum + val, 0) / actual.length;
    const totalSumSquares = actual
        .map(val => Math.pow(val - meanActual, 2))
        .reduce((sum, val) => sum + val, 0);

    const residualSumSquares = actual
        .map((val, i) => Math.pow(val - predicted[i], 2))
        .reduce((sum, val) => sum + val, 0);

    return Math.round((1 - residualSumSquares / totalSumSquares) * 100) / 100;
}

/**
 * Calculate Root Mean Square Error (RMSE)
 */
export function calculateRMSE(actual: number[], predicted: number[]): number {
    const squaredErrors = actual.map((val, i) => Math.pow(val - predicted[i], 2));
    const meanSquaredError = squaredErrors.reduce((sum, val) => sum + val, 0) / actual.length;
    return Math.sqrt(meanSquaredError);
}

/**
 * Split data into training and testing sets
 */
export function splitTrainTest(
    features: any[][],
    target: number[],
    testSize: number = 0.2
): {
    trainFeatures: any[][];
    testFeatures: any[][];
    trainTarget: number[];
    testTarget: number[];
} {
    const totalSize = features.length;
    const testCount = Math.floor(totalSize * testSize);
    const trainCount = totalSize - testCount;

    // Shuffle indices
    const indices = Array.from({ length: totalSize }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    // Split data
    const trainIndices = indices.slice(0, trainCount);
    const testIndices = indices.slice(trainCount);

    return {
        trainFeatures: trainIndices.map(i => features[i]),
        testFeatures: testIndices.map(i => features[i]),
        trainTarget: trainIndices.map(i => target[i]),
        testTarget: testIndices.map(i => target[i])
    };
}

export default {
    calculateRollingStats,
    calculateR2,
    calculateRMSE,
    splitTrainTest
};
