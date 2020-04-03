import { Feature, FeatureCollection } from '@turf/helpers';
export default class DrawSource {
  public data: FeatureCollection;
  constructor(data?: FeatureCollection) {
    this.data = data || this.getDefaultData();
  }

  public addFeature(feature: any) {
    this.data.features.push(feature);
  }

  public getFeature(id: string): Feature | undefined {
    const result = this.data.features.find((fe: Feature) => {
      return fe?.properties?.id === id;
    });

    return result;
  }
  public removeFeature(feature: Feature) {
    const index = this.getFeatureIndex(feature);
    if (index !== undefined) {
      this.data.features.splice(index, 1);
    }
  }
  public setFeatureActive(feature: Feature) {
    const fe = this.getFeature(feature?.properties?.id);
    if (fe && fe.properties) {
      fe.properties.active = true;
    }
  }

  public setFeatureUnActive(feature: Feature) {
    const fe = this.getFeature(feature?.properties?.id);
    if (fe && fe.properties) {
      fe.properties.active = false;
    }
  }
  public clearFeatureActive() {
    this.data.features.forEach((fe: Feature) => {
      if (fe && fe.properties) {
        fe.properties.active = false;
      }
    });
  }
  public updateFeature(feature: Feature) {
    this.removeFeature(feature);
    this.addFeature(feature);
  }
  private getDefaultData(): FeatureCollection {
    return {
      type: 'FeatureCollection',
      features: [],
    };
  }

  private getFeatureIndex(feature: Feature): number | undefined {
    return this.data.features.findIndex((fe) => {
      return fe?.properties?.id === feature?.properties?.id;
    });
  }
}