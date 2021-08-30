import { CsGoDataRepository } from '../../persistence/repositories/CsGoDataRepository';
import { CsGoVideo } from '../../persistence/entities/csgo/CsGoVideo';
import { Parameter } from '../../dtos/Parameter';
import { CsGoParamType } from '../../dtos/csgo/CsGoParamType';
import { EnumHelper } from '../../helpers/EnumHelper';

import Fuse from 'fuse.js';

export class CsGoNadesService {

    private mapOptions: Fuse.IFuseOptions<CsGoVideo>;
    private typeOptions: Fuse.IFuseOptions<CsGoVideo>;
    private sideOptions: Fuse.IFuseOptions<CsGoVideo>;
    private locationOptions: Fuse.IFuseOptions<CsGoVideo>;

    private fuseSide: Fuse<CsGoVideo>;
    private fuseType: Fuse<CsGoVideo>;
    private fuseMap: Fuse<CsGoVideo>;

    private masterList: CsGoVideo[];

    constructor(private csGoDataRepository: CsGoDataRepository) {

        this.masterList = this.csGoDataRepository.getAll();

        this.sideOptions = { keys: ["side"], threshold: 0 };
        this.typeOptions = { keys: ["type"], threshold: 0.4 };
        this.mapOptions = { keys: ["map"], threshold: 0.3, minMatchCharLength: 4 };
        this.locationOptions = { keys: ["location"], threshold: 0.5 };

        this.fuseSide = new Fuse(this.masterList, this.sideOptions);
        this.fuseType = new Fuse(this.masterList, this.typeOptions);
        this.fuseMap = new Fuse(this.masterList, this.mapOptions);
    }

    public getForQuery(queryString: string) {

        let extractedParams: Parameter[] = [];

        // search over all properties for all parameters.
        let queryParts = queryString.split(" ");
        for (let i = queryParts.length - 1; i >= 0; i--) {
            const part = queryParts[i];

            // decide which search param it is.
            const paramType = this.decideSearchParamType(part);
            if (paramType !== CsGoParamType.None) {
                extractedParams.push(new Parameter(paramType, part));
                queryParts.splice(i, 1);
            }
        };

        // the rest is location param.
        if (queryParts.length > 0) {
            extractedParams.push(new Parameter(CsGoParamType.Location, queryParts.join(" ")))
        }

        let results = this.masterList;

        extractedParams.forEach(param => {
            let tempFuse: Fuse<CsGoVideo> = null;

            let paramEnum = EnumHelper.toCsGoParamType(param.name);
            switch (paramEnum) {

                case CsGoParamType.Side:
                    tempFuse = new Fuse(results, this.sideOptions);
                    break;
                case CsGoParamType.Type:
                    tempFuse = new Fuse(results, this.typeOptions);
                    break;
                case CsGoParamType.Map:
                    tempFuse = new Fuse(results, this.mapOptions);
                    break;
                case CsGoParamType.Location:
                    tempFuse = new Fuse(results, this.locationOptions);
                    break;
            }

            if (tempFuse !== null) {
                let tempSearched = tempFuse.search(param.value);
                results = results.filter(r => tempSearched.some(t => t.item === r))
            }

        });

        return results.sort((a, b) => {
            // sort by map...
            if (a.map < b.map)return -1;
            else if (a.map > b.map) return 1;
        
            // .. then by side ..
            if (a.side < b.side)return -1;
            else if (a.side > b.side) return 1;
        
            // .. then by type ..
            if (a.type < b.type)return -1;
            else if (a.type > b.type) return 1;
        
            // .. then by location.
            if (a.location < b.location)return -1;
            else if (a.location > b.location) return 1;
            
            return 0;
        });
    }

    private decideSearchParamType(part: string): CsGoParamType {
        if (this.fuseSide.search(part).length > 0)
            return CsGoParamType.Side
        if (this.fuseType.search(part).length > 0)
            return CsGoParamType.Type;
        if (this.fuseMap.search(part).length > 0)
            return CsGoParamType.Map;

        // CsGoParamType.Location is resolved separately.

        return CsGoParamType.None;
    }
}