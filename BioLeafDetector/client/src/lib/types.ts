export interface Disease {
  name: string;
  description: string;
  severity: 'Low' | 'Moderate' | 'Severe' | 'Healthy';
}

export interface TreatmentOption {
  title: string;
  description: string;
  icon: string;
}

export interface PreventionMeasure {
  title: string;
  description: string;
  icon: string;
}

export interface AnalysisResult {
  id: number;
  imageUrl: string;
  disease: Disease;
  treatmentOptions: TreatmentOption[];
  preventionMeasures: PreventionMeasure[];
  analyzedAt: string;
}

export interface HistoryItem {
  id: number;
  imageUrl: string;
  disease: Disease;
  analyzedAt: string;
}

export interface ApiResponse {
  disease: {
    name: string;
    description: string;
    severity: 'Low' | 'Moderate' | 'Severe' | 'Healthy';
  };
  treatment: {
    title: string;
    description: string;
    icon: string;
  }[];
  prevention: {
    title: string;
    description: string;
    icon: string;
  }[];
}
