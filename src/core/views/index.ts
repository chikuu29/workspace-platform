import { ViewRegistry, ViewType } from "../registry/ViewRegistry";
import SectionView from "./SectionView";
import FormView from "./FormView";
import GridView from "./GridView";
import PageView from "./PageView";
import ContainerView from "./ContainerView";

ViewRegistry.register(ViewType.SECTION_VIEW, SectionView);
ViewRegistry.register(ViewType.FORM_VIEW, FormView);
ViewRegistry.register(ViewType.GRID_VIEW, GridView);
ViewRegistry.register(ViewType.PAGE_VIEW, PageView);
ViewRegistry.register(ViewType.CONTAINER_VIEW, ContainerView);