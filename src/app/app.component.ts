import { Component } from '@angular/core';
import { SharedService } from './shared.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'coding-challenge-v2';
  selectedCount: number = 0;
  items: any;


  constructor(private sharedService: SharedService) { }

  addBlueBorder(item: any) {
    item.isHovered = true;
  }

  removeBlueBorder(item: any) {
    item.isHovered = false;
  }

  toggleSelection(item: any) {
    item.isSelected = !item.isSelected;
    this.selectedCount = this.items.filter((item: { isSelected: any; }) => item.isSelected).length;
    this.sharedService.setSelectedCount(this.selectedCount);

    if (this.selectedCount === 2) {
      const thirdElement = this.items.find((item: { isSelected: any; }) => !item.isSelected);
      if (thirdElement) {
        thirdElement.isSelected = true;
        this.selectedCount = 3;
        this.sharedService.setSelectedCount(this.selectedCount);
      }
    }
  }


  tasks = [
    {
      title: 'task 1',
      completed: false,
    },
    {
      title: 'task 2',
      completed: false,
    },
    {
      title: 'task 3',
      completed: false,
    },
    {
      title: 'task 4',
      completed: false,
    },
  ];

  completedTasks = [
    {
      title: 'task 5',
      completed: false,
    },
    {
      title: 'task 6',
      completed: false,
    },
    {
      title: 'task 7',
      completed: false,
    },
    {
      title: 'task 8',
      completed: false,
    },
  ];

  addTask(description: string) {
    this.tasks.push({
      title: description,
      completed: false,
    });

  }

  deleteTask(task: any) {
    let index = this.tasks.indexOf(task);
    if (index !== -1) {
      this.tasks.splice(index, 1);
    }
  }




}
