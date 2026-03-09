# Firestore Security Rules для новой структуры

## Правила безопасности

Скопируйте эти правила в Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Правила для пользователей
    match /users/{userId} {
      // Разрешить доступ только владельцу
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Правила для проектов
      match /projects/{projectId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // Правила для записей времени (НОВАЯ КОЛЛЕКЦИЯ)
      match /timeEntries/{entryId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
        
        // Валидация при создании
        allow create: if request.auth != null 
                      && request.auth.uid == userId
                      && request.resource.data.projectId is string
                      && request.resource.data.date is timestamp
                      && request.resource.data.startTime is timestamp
                      && request.resource.data.endTime is timestamp
                      && request.resource.data.duration is number
                      && request.resource.data.type in ["MANUAL", "TIMER"];
        
        // Валидация при обновлении (projectId не должен меняться)
        allow update: if request.auth != null 
                      && request.auth.uid == userId
                      && request.resource.data.projectId == resource.data.projectId;
      }
      
      // Правила для таймеров
      match /timers/{timerId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

## Composite Indexes (требуется создать)

Firestore автоматически предложит создать эти индексы при первом запросе. Или создайте их вручную:

### Index 1: Сортировка записей по дате и времени
- **Collection:** `users/{userId}/timeEntries`
- **Fields:**
  - `date` (Descending)
  - `startTime` (Descending)

### Index 2: Фильтрация по дате (для TodayBlock)
- **Collection:** `users/{userId}/timeEntries`
- **Fields:**
  - `date` (Ascending)

### Index 3: Фильтрация по проекту и дате (опционально)
- **Collection:** `users/{userId}/timeEntries`
- **Fields:**
  - `projectId` (Ascending)
  - `date` (Descending)

## Шаги по обновлению в Firebase Console

1. Откройте [Firebase Console](https://console.firebase.google.com/)
2. Выберите проект `time-tracker-25243`
3. Перейдите в **Firestore Database** → **Rules**
4. Замените текущие правила на правила выше
5. Нажмите **Publish**
6. Перейдите в **Firestore Database** → **Data**
7. Удалите старые тестовые данные из `users/{userId}/projects/{projectId}/timeEntries`
8. При первом использовании приложения Firestore предложит создать необходимые индексы - согласитесь

## Проверка

После обновления правил и удаления старых данных:

1. ✅ Создайте новую запись времени через форму
2. ✅ Проверьте, что запись появилась в `users/{userId}/timeEntries`
3. ✅ Убедитесь, что запись содержит поле `projectId`
4. ✅ Проверьте отображение в списке записей
5. ✅ Попробуйте отредактировать запись
6. ✅ Попробуйте удалить запись
7. ✅ Проверьте работу таймера
8. ✅ Проверьте блок "Сегодня" на дашборде

## Структура данных в новой коллекции

```javascript
users/{userId}/timeEntries/{entryId}
{
  projectId: "abc123",           // ID проекта (обязательно)
  date: Timestamp,               // Дата начала (00:00:00)
  startTime: Timestamp,          // Время начала
  endTime: Timestamp,            // Время окончания
  duration: 3600,                // Длительность в секундах
  type: "MANUAL" | "TIMER",      // Тип записи
  createdAt: Timestamp           // Время создания
}
```
