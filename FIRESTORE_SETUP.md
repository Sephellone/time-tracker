# Настройка правил безопасности Firestore

## Проблема
При регистрации возникает ошибка "Missing or insufficient permissions", потому что правила безопасности Firestore по умолчанию запрещают запись данных.

## Решение

### Шаг 1: Откройте консоль Firebase
1. Перейдите на https://console.firebase.google.com/
2. Выберите проект `time-tracker-25243`

### Шаг 2: Настройте правила Firestore
1. В левом меню выберите **Firestore Database**
2. Перейдите на вкладку **Rules** (Правила)
3. Замените существующие правила на следующие:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Правило для коллекции users
    match /users/{userId} {
      // Пользователь может читать и писать только свой документ
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Подколлекция projects
      match /projects/{projectId} {
        // Пользователь может читать и писать только свои проекты
        allow read, write: if request.auth != null && request.auth.uid == userId;
        
        // Подколлекция timeEntries
        match /timeEntries/{timeEntryId} {
          // Пользователь может читать и писать только свои записи времени
          allow read, write: if request.auth != null && request.auth.uid == userId;
        }
      }
    }
    
    // Запретить доступ ко всем остальным документам
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

4. Нажмите кнопку **Publish** (Опубликовать)

### Шаг 3: Проверьте работу
После применения правил:
1. Попробуйте войти с уже созданным пользователем
2. Приложение должно успешно создать документ пользователя и перенаправить на dashboard

## Что делают эти правила

- ✅ Каждый авторизованный пользователь может читать и изменять только свои данные
- ✅ Доступ к `users/{userId}` только если `userId` совпадает с ID авторизованного пользователя
- ✅ Доступ к проектам и записям времени только для владельца
- ❌ Неавторизованные пользователи не имеют доступа к данным
- ❌ Пользователи не могут видеть чужие данные

## Альтернатива: Использование Firebase CLI

Если у вас установлен Firebase CLI, можно применить правила из файла `firestore.rules`:

```bash
firebase deploy --only firestore:rules
```
