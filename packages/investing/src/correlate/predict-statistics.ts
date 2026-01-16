/**
 * @file predict-statistics.ts
 * @description Statistical analysis and prediction library.
 */
import xgboost from "xgboost_node";

/**
 * Configuration parameters for XGBoost model training.
 * @see {@link https://xgboost.readthedocs.io/en/release_3.0.0/parameter.html XGBoost Parameters Documentation}
 */
export interface XGBoostParams {
  /** Controls output verbosity: 0=silent, 1=warnings, 2=info, 3=debug. Default: 1 */
  verbosity?: number;
  /** Maximum depth of each tree. Higher values increase complexity and overfitting risk. Default: 6 */
  max_depth?: number;
  /** Learning rate (step size shrinkage). Smaller values require more rounds but improve generalization. Default: 0.3 */
  eta?: number;
  /** Learning task objective (e.g., 'reg:squarederror' for regression, 'binary:logistic' for classification) */
  objective?: string;
  /** Number of parallel threads for training. Default: maximum available */
  nthread?: number;
  /** Fraction of training instances sampled per tree (0-1). Values <1 reduce overfitting. Default: 1 */
  subsample?: number;
  /** Fraction of features sampled per tree (0-1). Adds diversity like Random Forest. Default: 1 */
  colsample_bytree?: number;
  /** Fraction of features sampled per tree level (0-1). Additional regularization layer. Default: 1 */
  colsample_bylevel?: number;
  /** Minimum sum of instance weights in a leaf. Higher values prevent overly specific splits. Default: 1 */
  min_child_weight?: number;
  /** Minimum loss reduction required for a split. Higher values make splitting more conservative. Default: 0 */
  gamma?: number;
  /** L1 regularization (lasso). Encourages sparsity/feature selection. Default: 0 */
  alpha?: number;
  /** L2 regularization (ridge). Penalizes large weights to prevent overfitting. Default: 1 */
  lambda?: number;
  /** Stop training after N rounds without validation improvement. Prevents overfitting. */
  early_stopping_rounds?: number;
  /** Random seed for reproducibility. Default: 0 */
  seed?: number;
  /** Number of boosting rounds (trees to build). More rounds needed with lower eta. */
  nrounds?: number;
  /** Tree construction algorithm: 'auto', 'exact', 'approx', 'hist', 'gpu_hist'. Default: 'auto' */
  tree_method?: string;
  /** Tree growth policy: 'depthwise' (level-by-level) or 'lossguide' (leaf-by-leaf). Default: 'depthwise' */
  grow_policy?: string;
  /** Index signature for additional XGBoost parameters not explicitly typed */
  [key: string]: any;
}

export interface TrainModelOptions {
  xgbParams?: XGBoostParams;
  testSize?: number;
  featuresToUse: string[];
}

export interface PredictOptions {
  featuresToUse: string[];
}

/**
 * Trains an XGBoost model on preprocessed data and evaluates its performance.
 *
 * XGBoost (eXtreme Gradient Boosting) works by sequentially building decision trees
 * where each new tree corrects errors made by the ensemble of previous trees.
 * It uses gradient descent to minimize a loss function by adding trees that
 * predict the residuals or errors of prior trees, then combining them through boosting.
 * The algorithm employs regularization techniques to prevent overfitting and handles
 * missing values effectively through its sparsity-aware split finding approach.
 *
 * @param fullData - Preprocessed training data as array of objects with numeric values only
 * @param targetName - Name of the target variable column to predict
 * @param options - Configuration options for model training
 *
 * // General Parameters
 * @param options.xgbParams.verbosity - [default=1] Controls the verbosity of XGBoost's output
 *   0: silent mode (no messages)
 *   1: warnings only
 *   2: info messages
 *   3: debug messages
 *
 * // Tree Booster Parameters (Control tree structure)
 * @param options.xgbParams.max_depth - [default=6] Maximum depth of each tree
 *   Controls model complexity. Higher values create more complex trees that may overfit.
 *   Reduced from 8 to 6 to limit tree complexity and prevent overfitting.
 *
 * @param options.xgbParams.eta - [default=0.3, alias: learning_rate] Step size shrinkage
 *   Controls how much weight is given to new trees in each boosting round.
 *   Smaller values (0.1) make the model more robust by shrinking feature weights.
 *   Set to 0.1 to allow more conservative boosting, requiring more trees but improving generalization.
 *
 * @param options.xgbParams.objective - Specifies the learning task and objective
 *   'reg:squarederror': Regression with squared loss (minimize MSE)
 *   Options include classification objectives, ranking, and other regression metrics.
 *
 * @param options.xgbParams.nthread - Number of parallel threads used for training
 *   Set to 4 to utilize multi-core processing without overwhelming the system.
 *
 * @param options.xgbParams.subsample - [default=1] Fraction of training instances used per tree
 *   Values < 1 implement random sampling of the training data for each tree.
 *   Set to 0.9 to reduce overfitting by introducing randomness while using most of the data.
 *
 * @param options.xgbParams.colsample_bytree - [default=1] Fraction of features used per tree
 *   Controls feature sampling for each tree, similar to Random Forest.
 *   Set to 0.9 to reduce overfitting and create diverse trees.
 *
 * @param options.xgbParams.min_child_weight - [default=1] Minimum sum of instance weight in a child
 *   Controls the minimum number of instances needed in a leaf node.
 *   Set to 3 to prevent the model from creating overly specific rules based on few samples.
 *
 * @param options.xgbParams.gamma - [default=0, alias: min_split_loss] Minimum loss reduction for a split
 *   Controls the minimum reduction in the loss function required to make a split.
 *   Set to 0.1 to make splitting more conservative and reduce overfitting.
 *
 * // Regularization Parameters
 * @param options.xgbParams.alpha - [default=0, alias: reg_alpha] L1 regularization on weights
 *   Encourages sparsity by penalizing non-zero weights (feature selection).
 *   Set to 0 as gamma is being used for regularization.
 *
 * @param options.xgbParams.lambda - [default=1, alias: reg_lambda] L2 regularization on weights
 *   Penalizes large weights to prevent overfitting (similar to Ridge regression).
 *   Default value of 1 provides moderate regularization.
 *
 * // Learning Control Parameters
 * @param options.xgbParams.early_stopping_rounds - Stop training if performance doesn't improve
 *   Stops adding trees when the validation metric doesn't improve for specified rounds.
 *   Set to 20 to prevent overfitting by stopping when the model stops improving.
 *
 * @param options.xgbParams.seed - [default=0] Random number seed for reproducibility
 *   Set to 42 to ensure consistent results across training runs.
 *
 * @param options.xgbParams.nrounds - Number of boosting rounds (trees to build)
 *   Set to 1000 to compensate for the lower learning rate (eta),
 *   allowing the model to converge slowly but more accurately.
 *
 * @param options.testSize - Proportion of data to use for testing (default: 0.2)
 * @param options.featuresToUse - Specific feature columns to use for training
 * @see [XGBoost_parameters](https://xgboost.readthedocs.io/en/release_3.0.0/parameter.html)
 * @author [vtempest](https://github.com/vtempest)
 * @license MIT
 * @returns R² value (coefficient of determination) indicating model accuracy
 * @example
 *  let data = [
 *    {
 *      "feature1": 1,
 *      "feature2": 2,
 *      "target": 3
 *    }
 *  ];
 *  let options = {
 *    xgbParams: {
 *      verbosity: 0,
 *      max_depth: 7,
 *      eta: 0.07,
 *      objective: 'reg:squarederror',
 *      nthread: 4,
 *    }
 *  };
 *  let accuracy = await trainModels(data, 'target', options);
 *  console.log(accuracy);
 */
export async function trainModels(
  fullData: any[],
  targetName: string,
  options: TrainModelOptions
): Promise<number> {
  const {
    xgbParams = {
      verbosity: 0,
      max_depth: 7, // Slightly increased with stronger regularization
      eta: 0.07, // Reduced learning rate for better convergence
      objective: "reg:squarederror",
      nthread: 4,
      subsample: 0.85, // Added stochasticity while maintaining data leverage
      colsample_bytree: 0.8, // More conservative feature sampling
      colsample_bylevel: 0.8, // Additional per-level sampling
      min_child_weight: 5, // Stronger protection against small leaves
      gamma: 0.2, //   Increased split cost regularization
      alpha: 0.1, // Mild L1 regularization
      lambda: 1.5, // Stronger L2 regularization
      early_stopping_rounds: 50, // More patience for validation improvements
      seed: 42,
      nrounds: 2000, // Increased with safer early stopping
      tree_method: "hist", // Optimized for speed/accuracy balance
      grow_policy: "depthwise", // Conservative growth strategy
      ...options.xgbParams,
    },
    testSize = 0.1,
    featuresToUse,
  } = options;

  // Extract features and target variables
  const features = fullData
    .map((row) => {
      return {
        ...featuresToUse.reduce((obj: any, key) => {
          obj[key] = row[key];
          return obj;
        }, {}),
      };
    })
    .filter((f) => Object.values(f).length > 0);

  let featureArray = features.map((f) => Object.values(f));

  featureArray = featureArray.map((row: any[]) => row.map(Number));
  const target = fullData.map((row) => row[targetName]);

  // Split data into training and testing sets
  const { trainFeatures, testFeatures, trainTarget, testTarget } =
    splitTrainTest(featureArray, target, testSize);

  // Prepare feature arrays for training
  const trainFeatureArray = Object.values(trainFeatures)
    .map((f) => Object.values(f))
    .map((row: any) => row.map(Number));
  const testFeatureArray = Object.values(testFeatures)
    .map((f) => Object.values(f))
    .map((row: any) => row.map(Number));

  // Remove NaN values from training data
  const validIndices: number[] = [];
  for (let i = 0; i < trainTarget.length; i++) {
    if (!isNaN(trainTarget[i])) {
      validIndices.push(i);
    }
  }

  const trainFeaturesClean = validIndices.map((i) => trainFeatureArray[i]);
  const trainTargetClean = validIndices.map((i) => trainTarget[i]);

  // Train model
  await xgboost.train(trainFeaturesClean, trainTargetClean, xgbParams);

  //  evaluate performance
  const accuracy = calculateR2(
    await xgboost.predict(testFeatureArray),
    testTarget
  );

  return accuracy;
}

/**
 * Splits data into training and testing sets
 * @param features - Feature array
 * @param target - Target array
 * @param testSize - Proportion of data to use for testing
 * @returns Split datasets
 */
function splitTrainTest(
  features: any[][],
  target: any[],
  testSize: number = 0.2
) {
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
    trainFeatures: trainIndices.map((i) => features[i]),
    testFeatures: testIndices.map((i) => features[i]),
    trainTarget: trainIndices.map((i) => target[i]),
    testTarget: testIndices.map((i) => target[i]),
  };
}

/**
 * Calculates Root Mean Square Error (RMSE) between actual and predicted values
 * @param actual - Array of actual values
 * @param predicted - Array of predicted values
 * @returns Root Mean Square Error value
 */
export function calculateRMSE(actual: number[], predicted: number[]): number {
  const squaredErrors = actual.map((val, i) => Math.pow(val - predicted[i], 2));
  const meanSquaredError =
    squaredErrors.reduce((sum, val) => sum + val, 0) / actual.length;
  return Math.sqrt(meanSquaredError);
}

/**
 * Calculates R-squared (coefficient of determination) between actual and predicted values
 * @param predicted - Array of predicted values
 * @param actual - Array of actual values
 * @returns R-squared value between 0 and 1
 */
function calculateR2(predicted: number[], actual: number[]): number {
  const meanActual = actual.reduce((sum, val) => sum + val, 0) / actual.length;
  const totalSumSquares = actual
    .map((val) => Math.pow(val - meanActual, 2))
    .reduce((sum, val) => sum + val, 0);

  const residualSumSquares = actual
    .map((val, i) => Math.pow(val - predicted[i], 2))
    .reduce((sum, val) => sum + val, 0);

  return Math.round((1 - residualSumSquares / totalSumSquares) * 100) / 100;
}

/**
 * Predicts target variable for future data using the trained XGBoost model
 * @param futureData - Array of weather data objects for future dates
 * @returns Promise resolving to array of data objects with predictions
 */
export function predictFuture(
  futureData: any[],
  options: PredictOptions
): Promise<any[]> {
  const { featuresToUse } = options;

  // Extract only the required weather features from future data
  let futureDataClean = futureData.map((row) => {
    return {
      ...featuresToUse.reduce((obj: any, key) => {
        obj[key] = row[key];
        return obj;
      }, {}),
    };
  });

  // Convert features to array format for XGBoost prediction
  const featureArray = futureDataClean
    .map((f) => Object.values(f))
    .map((row) => row.map(Number))
    .filter((row) => row.length > 1 && !!row[0]);

  // console.log(JSON.stringify(featureArray));
  // Make predictions using the XGBoost model
  return xgboost.predict(featureArray).then((predictions: any[]) => {
    // Add predictions back to original data objects
    futureData.forEach((row, i) => {
      row.predicted = predictions[i];
    });
    return futureData;
  });
}
/**
 * Saves the trained XGBoost model to the specified file path
 * @param modelPath - Path where the model should be saved
 * @returns Promise that resolves when the model is saved
 */
export async function saveModel(modelPath: string): Promise<void> {
  await xgboost.saveModel(modelPath);
}

/**
 * Loads a trained XGBoost model from the specified file path
 * @param modelPath - Path to the saved model file
 * @returns Promise that resolves when the model is loaded
 */
export async function loadModel(modelPath: string): Promise<void> {
  await xgboost.loadModel(modelPath);
}

/**
 * Calculate rolling statistics for a given array of values
 * @param data - Array of data objects
 * @param field - Field name to calculate rolling stats for
 * @param window - Rolling window size
 * @returns Array with added rolling statistics
 */
export function calculateRollingStats(
  data: any[],
  field: string,
  window: number = 7
): any[] {
  return data.map((item, index) => {
    if (index < window - 1) {
      // Not enough data points for full window, use the first value
      return {
        ...item,
        [`${field}_rolling_mean_${window}d`]: item[field],
        [`${field}_rolling_std_${window}d`]: item[field],
      };
    }

    // Get values for the rolling window
    const windowValues = data
      .slice(index - window + 1, index + 1)
      .map((d) => d[field])
      .filter((val) => val !== null && val !== undefined && !isNaN(val));

    if (windowValues.length === 0) {
      return {
        ...item,
        [`${field}_rolling_mean_${window}d`]: null,
        [`${field}_rolling_std_${window}d`]: null,
      };
    }

    // Calculate rolling mean
    const mean =
      windowValues.reduce((sum, val) => sum + val, 0) / windowValues.length;

    // Calculate rolling standard deviation
    const variance =
      windowValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      windowValues.length;
    const std = Math.sqrt(variance);

    return {
      ...item,
      [`${field}_rolling_mean_${window}d`]: Math.floor(mean), // Round to 2 decimal places
      [`${field}_rolling_std_${window}d`]: Math.floor(std),
    };
  });
}
