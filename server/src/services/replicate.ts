const REPLICATE_BASE = 'https://api.replicate.com/v1';

const TRAINING_MAP: Record<string, { owner: string; model: string; version: string }> = {
  'llama-2-7b': { owner: 'meta', model: 'llama-2-7b', version: '' },
  'llama-2-13b': { owner: 'meta', model: 'llama-2-13b', version: '' },
  'llama-31-8b': { owner: 'meta', model: 'meta-llama-3.1-8b-instruct', version: '' },
  'mistral-7b-v03': { owner: 'mistralai', model: 'mistral-7b-v0.1', version: '' },
  'gemma-2-2b': { owner: 'google', model: 'gemma-2b', version: '' },
  'gemma-7b': { owner: 'google', model: 'gemma-7b', version: '' },
};

export function getTrainableModels(): string[] {
  return Object.keys(TRAINING_MAP);
}

export function isModelTrainable(modelId: string): boolean {
  const baseId = modelId.replace(/-q\d[_-]k[_-][msla]$/, '').replace(/-q\d[-_]\d$/, '');
  return baseId in TRAINING_MAP;
}

function getApiKey(): string {
  const key = process.env.REPLICATE_API_TOKEN;
  if (!key) throw new Error('REPLICATE_API_TOKEN not set in environment');
  return key;
}

export function createDataUrl(content: string): string {
  const base64 = Buffer.from(content).toString('base64');
  return `data:application/jsonl;base64,${base64}`;
}

interface TrainingInput {
  modelId: string;
  datasetUrl: string;
  destinationName: string;
  config: {
    learningRate: number;
    epochs: number;
    batchSize: number;
    loraRank: number;
    loraAlpha: number;
    loraDropout: number;
    maxSequenceLength: number;
    warmupSteps: number;
    weightDecay: number;
    gradientAccumulationSteps: number;
    optimizer: string;
    scheduler: string;
  };
}

export interface ReplicateTraining {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  logs: string;
  error: string | null;
  output: Record<string, unknown> | null;
  metrics: Record<string, unknown> | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  urls: { get: string; cancel: string };
}

export async function createTraining(input: TrainingInput): Promise<ReplicateTraining> {
  const baseId = input.modelId.replace(/-q\d[_-]k[_-][msla]$/, '').replace(/-q\d[-_]\d$/, '');
  const modelInfo = TRAINING_MAP[baseId];

  if (!modelInfo) {
    throw new Error(`Model ${input.modelId} is not available for training on Replicate`);
  }

  if (!modelInfo.version) {
    throw new Error(`Replicate training is not configured for model ${input.modelId}`);
  }

  const replicateUsername = process.env.REPLICATE_USERNAME || 'modelforge';
  const destination = `${replicateUsername}/${input.destinationName}`;

  const trainingInput: Record<string, unknown> = {
    train_data: input.datasetUrl,
    num_train_epochs: input.config.epochs,
    learning_rate: input.config.learningRate,
    train_batch_size: input.config.batchSize,
    lora_rank: input.config.loraRank,
    lora_alpha: input.config.loraAlpha,
    lora_dropout: input.config.loraDropout,
    max_seq_length: input.config.maxSequenceLength,
    warmup_ratio: input.config.warmupSteps > 0 ? 0.03 : 0,
    weight_decay: input.config.weightDecay,
    gradient_accumulation_steps: input.config.gradientAccumulationSteps,
    optimizer: input.config.optimizer === 'adamw' ? 'adamw_torch' : input.config.optimizer,
    lr_scheduler_type: input.config.scheduler,
    logging_steps: 1,
  };

  const response = await fetch(
    `${REPLICATE_BASE}/models/${modelInfo.owner}/${modelInfo.model}/versions/${modelInfo.version}/trainings`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getApiKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        destination,
        input: trainingInput,
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Replicate training creation failed: ${response.status} ${err}`);
  }

  return await response.json();
}

export async function getTrainingStatus(trainingId: string): Promise<ReplicateTraining> {
  const response = await fetch(`${REPLICATE_BASE}/trainings/${trainingId}`, {
    headers: { Authorization: `Bearer ${getApiKey()}` },
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to get training status: ${response.status} ${err}`);
  }

  return await response.json();
}

export async function cancelTraining(trainingId: string): Promise<void> {
  const response = await fetch(`${REPLICATE_BASE}/trainings/${trainingId}/cancel`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getApiKey()}` },
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to cancel training: ${response.status} ${err}`);
  }
}

export interface ParsedMetrics {
  steps: Array<{
    step: number;
    loss: number;
    learningRate: number;
    epoch: number;
  }>;
  currentStep: number;
  totalSteps: number;
  currentEpoch: number;
  currentLoss: number;
  currentLr: number;
}

export function parseTrainingLogs(logs: string, fromIndex: number = 0): { metrics: ParsedMetrics; newIndex: number } {
  const lines = logs.split('\n');
  const steps: ParsedMetrics['steps'] = [];

  let currentStep = 0;
  let totalSteps = 0;
  let currentEpoch = 0;
  let currentLoss = 0;
  let currentLr = 0;
  let newIndex = fromIndex;

  for (let i = fromIndex; i < lines.length; i++) {
    const line = lines[i];
    newIndex = i + 1;

    const jsonMatch = line.match(/\{.*"loss".*\}/);
    if (jsonMatch) {
      try {
        const data = JSON.parse(jsonMatch[0]);
        if (data.loss !== undefined) {
          currentStep = data.step || currentStep + 1;
          currentLoss = data.loss;
          currentLr = data.learning_rate || currentLr;
          currentEpoch = data.epoch || currentEpoch;
          steps.push({
            step: currentStep,
            loss: currentLoss,
            learningRate: currentLr,
            epoch: currentEpoch,
          });
        }
      } catch {}
      continue;
    }

    const stepMatch = line.match(/[Ss]tep\s+(\d+)\/(\d+).*(?:loss|Loss)[=:\s]+([0-9.]+)/);
    if (stepMatch) {
      currentStep = parseInt(stepMatch[1]);
      totalSteps = parseInt(stepMatch[2]);
      currentLoss = parseFloat(stepMatch[3]);
      steps.push({ step: currentStep, loss: currentLoss, learningRate: currentLr, epoch: currentEpoch });
      continue;
    }

    const lossMatch = line.match(/(?:loss|train_loss)[=:\s]+([0-9.]+)/i);
    if (lossMatch) {
      currentLoss = parseFloat(lossMatch[1]);
      currentStep++;
      steps.push({ step: currentStep, loss: currentLoss, learningRate: currentLr, epoch: currentEpoch });
    }

    const lrMatch = line.match(/(?:learning_rate|lr)[=:\s]+([0-9.e-]+)/i);
    if (lrMatch) {
      currentLr = parseFloat(lrMatch[1]);
    }

    const epochMatch = line.match(/[Ee]poch[=:\s]+([0-9.]+)/);
    if (epochMatch) {
      currentEpoch = parseFloat(epochMatch[1]);
    }

    const totalMatch = line.match(/(?:total|max).*steps?[=:\s]+(\d+)/i);
    if (totalMatch) {
      totalSteps = parseInt(totalMatch[1]);
    }
  }

  return {
    metrics: { steps, currentStep, totalSteps, currentEpoch, currentLoss, currentLr },
    newIndex,
  };
}