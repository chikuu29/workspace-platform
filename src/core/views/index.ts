import { ViewRegistry, ViewType } from "../registry/ViewRegistry";
import SectionView from "./SectionView";
import FormView from "./FormView";


ViewRegistry.register(ViewType.SECTION_VIEW, SectionView);
ViewRegistry.register(ViewType.FORM_VIEW, FormView);