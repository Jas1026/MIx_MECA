import { Component, ViewEncapsulation, ViewChildren, QueryList } from '@angular/core';
import { ServerContentService } from 'src/app/services/server-content.service';

import { 
  CdkDragDrop, 
  moveItemInArray, 
  transferArrayItem,
  CdkDropList
} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-locations',
  templateUrl: './locations.page.html',
  styleUrls: ['./locations.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LocationsPage {

  @ViewChildren(CdkDropList) dropLists!: QueryList<CdkDropList>;
dummyList: any[] = [];
  locations: any[] = [];
  tree: any[] = [];

  form: any = {
    id_location: null,
    nombre: '',
    tipo: '',
    parent_id: null
  };

  constructor(private server: ServerContentService) {}

  ngOnInit() {
    this.loadLocations();
  }

  // 🔥 CARGAR
  loadLocations() {
    this.server.getLocations().subscribe((res: any) => {
      this.locations = res.data.sort((a: any, b: any) => a.orden - b.orden);
      this.buildTree();
    });
  }

  // 🔥 GUARDAR
  saveLocation() {
    this.server.saveLocation(this.form).subscribe(() => {
      this.resetForm();
      this.loadLocations();
    });
  }

  edit(loc: any) {
    this.form = { ...loc };
  }

  delete(id: any) {
    if (confirm('¿Eliminar ubicación?')) {
      this.server.deleteLocation(id).subscribe(() => {
        this.loadLocations();
      });
    }
  }

  resetForm() {
    this.form = {
      id_location: null,
      nombre: '',
      tipo: '',
      parent_id: null
    };
  }
buildTree() {

  // 🔥 reset listas de drop
  this.allDropLists = ['rootList'];

  // 🔥 mapa rápido
  const map: any = {};
  const roots: any[] = [];

  // 🔹 crear nodos
  this.locations.forEach(loc => {
    map[loc.id_location] = {
      ...loc,
      children: [],
      expanded: true // 👈 importante
    };

    // 🔥 SOLO listas reales (no padres)
    this.allDropLists.push('list-' + loc.id_location);
  });

  // 🔹 armar árbol
  this.locations.forEach(loc => {
    const node = map[loc.id_location];

    if (loc.parent_id && loc.parent_id !== loc.id_location) {
      map[loc.parent_id]?.children.push(node);
    } else {
      roots.push(node);
    }
  });

  // 🔹 ordenar hijos
  Object.values(map).forEach((node: any) => {
    node.children.sort((a: any, b: any) => a.orden - b.orden);
  });

  // 🔹 ordenar padres
  roots.sort((a: any, b: any) => a.orden - b.orden);

  this.tree = roots;
}
drop(event: CdkDragDrop<any[]>, newParentId: number | null) {

  const dragged = event.item.data;

  const isSameContainer = event.previousContainer === event.container;
  const oldParentId = dragged.parent_id ?? null;

  // 🚫 evitar auto-drop
  if (dragged.id_location === newParentId) {
    return;
  }

  // 🧠 SOLO si cambia de padre
  const isChangingParent = oldParentId !== newParentId;

  // 🚫 evitar ciclos SOLO si cambia de padre
  if (isChangingParent && this.isDescendant(dragged, newParentId!)) {
    alert('No puedes mover un padre dentro de su propio hijo');
    return;
  }

  // 🔥 SOLO SI CAMBIA DE PADRE Y TIENE HIJOS
  if (
    isChangingParent &&
    dragged.children &&
    dragged.children.length > 0
  ) {
    const confirmMove = confirm(
      'Esta ubicación tiene hijos. Si continúas, los hijos se separarán. ¿Deseas continuar?'
    );

    if (!confirmMove) return;

    // liberar hijos
    dragged.children.forEach((child: any) => {
      child.parent_id = null;
      this.tree.push(child);
    });

    dragged.children = [];
  }

  // 🔄 mover visual
  if (isSameContainer) {
    moveItemInArray(
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
  } else {
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
  }

  // 👇 actualizar parent SOLO si cambió
  if (isChangingParent) {
    dragged.parent_id = newParentId;
  }

  // 💾 guardar
  const dataToSave = this.flattenTree(this.tree, null);

  this.server.updateOrdera(dataToSave).subscribe({
    next: () => this.loadLocations(),
    error: (err) => console.error('Error backend:', err)
  });
}
  // 🔥 FLATTEN RECURSIVO (SOPORTA INFINITO)
  flattenTree(tree: any[], parentId: number | null): any[] {
    let result: any[] = [];

    tree.forEach((node: any, index: number) => {

      result.push({
        id_location: node.id_location,
        parent_id: parentId,
        orden: index
      });

      if (node.children && node.children.length) {
        result = result.concat(
          this.flattenTree(node.children, node.id_location)
        );
      }

    });

    return result;
  }
  allDropLists: string[] = [];
  isDescendant(parent: any, childId: number): boolean {
  if (!parent.children) return false;

  for (let child of parent.children) {
    if (child.id_location === childId) return true;
    if (this.isDescendant(child, childId)) return true;
  }

  return false;
}

}