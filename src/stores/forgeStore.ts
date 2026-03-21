import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ForgeConfig } from '@/types';
import { DEFAULT_FORGE_CONFIG } from '@/types';
import * as forgeApi from '@/services/forgeApi';

interface Dataset {
  id: string;
  name: string;
  fileName: string;
  fileSize: number;
  format: string;
  sampleCount: number;
  uploadedAt: string;
}

interface ForgedModel {
  id: string;
  name: string;
  baseModelId: string;
  baseModelName: string;
  avatar: string;
  systemPrompt: string;
  description: string;
  createdAt: string;
  trainingStatus: string;
  trainingJobId: string | null;
  metrics: Record<string, number> | null;
  downloadUrl: string | null;
}

interface TrainingJob {
  id: string;
  status: string;
  progress: number;
  currentEpoch: number;
  totalEpochs: number;
  currentStep: number;
  totalSteps: number;
  loss: number;
  learningRate: number;
  elapsed: number;
  estimatedRemaining: number;
  lossHistory: Array<{ step: number; value: number; epoch: number }>;
  lrHistory: Array<{ step: number; value: number; epoch: number }>;
  logs: Array<{ timestamp: string; level: string; message: string }>;
  error: string | null;
  gpuProvider: string;
  gpuType: string | null;
}

interface ForgeState {
  currentStep: number;
  selectedBaseModel: string | null;
  selectedBaseModelName: string | null;
  selectedDatasetId: string | null;
  config: ForgeConfig;
  modelName: string;
  modelDescription: string;
  systemPrompt: string;
  avatar: string;

  datasets: Dataset[];
  forgedModels: ForgedModel[];
  activeTrainingJob: TrainingJob | null;
  trainableModelIds: string[];

  isTraining: boolean;
  isUploading: boolean;
  error: string | null;
  unsubscribe: (() => void) | null;

  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setBaseModel: (id: string, name: string) => void;
  setDataset: (id: string) => void;
  updateConfig: (patch: Partial<ForgeConfig>) => void;
  setModelName: (name: string) => void;
  setModelDescription: (desc: string) => void;
  setSystemPrompt: (prompt: string) => void;
  setAvatar: (avatar: string) => void;

  uploadDataset: (file: File) => Promise<void>;
  pasteDataset: (content: string, name: string, format: string) => Promise<void>;
  loadDatasets: () => Promise<void>;
  deleteDataset: (id: string) => Promise<void>;
  loadForgedModels: () => Promise<void>;
  deleteForgedModel: (id: string) => Promise<void>;
  loadTrainableModels: () => Promise<void>;

  startTraining: () => Promise<void>;
  cancelTraining: () => Promise<void>;
  subscribeToTraining: (jobId: string) => void;
  clearError: () => void;
  resetWizard: () => void;
}

export const useForgeStore = create<ForgeState>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      selectedBaseModel: null,
      selectedBaseModelName: null,
      selectedDatasetId: null,
      config: DEFAULT_FORGE_CONFIG,
      modelName: '',
      modelDescription: '',
      systemPrompt: 'You are a helpful AI assistant.',
      avatar: '',

      datasets: [],
      forgedModels: [],
      activeTrainingJob: null,
      trainableModelIds: [],

      isTraining: false,
      isUploading: false,
      error: null,
      unsubscribe: null,

      setStep: (step: number) => set({ currentStep: step }),
      nextStep: () => set((s) => ({ currentStep: Math.min(s.currentStep + 1, 5) })),
      prevStep: () => set((s) => ({ currentStep: Math.max(s.currentStep - 1, 1) })),
      setBaseModel: (id: string, name: string) => set({ selectedBaseModel: id, selectedBaseModelName: name }),
      setDataset: (id: string) => set({ selectedDatasetId: id }),
      updateConfig: (patch: Partial<ForgeConfig>) => set((s) => ({ config: { ...s.config, ...patch } })),
      setModelName: (name: string) => set({ modelName: name }),
      setModelDescription: (desc: string) => set({ modelDescription: desc }),
      setSystemPrompt: (prompt: string) => set({ systemPrompt: prompt }),
      setAvatar: (avatar: string) => set({ avatar }),

      uploadDataset: async (file: File) => {
        set({ isUploading: true, error: null });
        try {
          const ds = await forgeApi.uploadDataset(file);
          set((s) => ({
            datasets: [ds, ...s.datasets],
            selectedDatasetId: ds.id,
            isUploading: false,
          }));
        } catch (err: unknown) {
          set({ error: err instanceof Error ? err.message : 'Upload failed', isUploading: false });
        }
      },

      pasteDataset: async (content: string, name: string, format: string) => {
        set({ isUploading: true, error: null });
        try {
          const ds = await forgeApi.pasteDataset(content, name, format);
          set((s) => ({
            datasets: [ds, ...s.datasets],
            selectedDatasetId: ds.id,
            isUploading: false,
          }));
        } catch (err: unknown) {
          set({ error: err instanceof Error ? err.message : 'Failed to save', isUploading: false });
        }
      },

      loadDatasets: async () => {
        try {
          const datasets = await forgeApi.fetchDatasets();
          set({ datasets });
        } catch {
          /* ignore */
        }
      },

      deleteDataset: async (id: string) => {
        await forgeApi.deleteDataset(id);
        set((s) => ({
          datasets: s.datasets.filter((d) => d.id !== id),
          selectedDatasetId: s.selectedDatasetId === id ? null : s.selectedDatasetId,
        }));
      },

      loadForgedModels: async () => {
        try {
          const models = await forgeApi.fetchForgedModels();
          set({ forgedModels: models });
        } catch {
          /* ignore */
        }
      },

      deleteForgedModel: async (id: string) => {
        await forgeApi.deleteForgedModel(id);
        set((s) => ({ forgedModels: s.forgedModels.filter((m) => m.id !== id) }));
      },

      loadTrainableModels: async () => {
        try {
          const ids = await forgeApi.fetchTrainableModels();
          set({ trainableModelIds: ids });
        } catch {
          /* ignore */
        }
      },

      startTraining: async () => {
        const s = get();
        if (!s.selectedBaseModel || !s.selectedDatasetId || !s.modelName) {
          set({ error: 'Please complete all required fields' });
          return;
        }
        set({ isTraining: true, error: null, currentStep: 5 });
        try {
          const result = await forgeApi.startTraining({
            baseModelId: s.selectedBaseModel,
            baseModelName: s.selectedBaseModelName || s.selectedBaseModel,
            datasetId: s.selectedDatasetId,
            config: s.config as unknown as Record<string, unknown>,
            modelName: s.modelName,
            systemPrompt: s.systemPrompt,
            description: s.modelDescription,
            avatar: s.avatar,
          });
          set({ activeTrainingJob: result.job });
          get().subscribeToTraining(result.job.id);
        } catch (err: unknown) {
          set({ error: err instanceof Error ? err.message : 'Training failed', isTraining: false });
        }
      },

      cancelTraining: async () => {
        const s = get();
        if (s.activeTrainingJob) {
          await forgeApi.cancelTraining(s.activeTrainingJob.id);
          s.unsubscribe?.();
          set({ isTraining: false, unsubscribe: null });
        }
      },

      subscribeToTraining: (jobId: string) => {
        const { unsubscribe: prev } = get();
        prev?.();

        const unsub = forgeApi.subscribeToTraining(
          jobId,
          (data: Record<string, unknown>) => {
            set((s) => ({
              activeTrainingJob: s.activeTrainingJob
                ? { ...s.activeTrainingJob, ...data }
                : null,
            }));
          },
          (status: string) => {
            set((s) => ({
              isTraining: false,
              activeTrainingJob: s.activeTrainingJob
                ? { ...s.activeTrainingJob, status }
                : null,
            }));
            get().loadForgedModels();
          },
          (error: string) => {
            set({ error, isTraining: false });
          }
        );

        set({ unsubscribe: unsub });
      },

      clearError: () => set({ error: null }),

      resetWizard: () => {
        get().unsubscribe?.();
        set({
          currentStep: 1,
          selectedBaseModel: null,
          selectedBaseModelName: null,
          selectedDatasetId: null,
          config: DEFAULT_FORGE_CONFIG,
          modelName: '',
          modelDescription: '',
          systemPrompt: 'You are a helpful AI assistant.',
          avatar: '',
          activeTrainingJob: null,
          isTraining: false,
          error: null,
          unsubscribe: null,
        });
      },
    }),
    {
      name: 'modelforge-forge',
      partialize: (state) => ({
        config: state.config,
        modelName: state.modelName,
        systemPrompt: state.systemPrompt,
      }),
    }
  )
);