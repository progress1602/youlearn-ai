import { useState } from 'react';

type Note = {
  id: number;
  content: string;
};

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');

//   const addNote = () => {
//     if (newNote.trim() === '') return;
//     setNotes([...notes, { id: Date.now(), content: newNote }]);
//     setNewNote('');
//   };

  const deleteNote = (id: number) => {
    setNotes(notes.filter((note) => note.id !== id));
  };

  return (
    <div className=" bg-black p-8">
      <h1 className="text-xl font-bold text-start mb-8">Notes</h1>
      <div className="mb-8">
        <textarea
          className="w-full p-4 min-h-96 shadow-sm focus:outline-none focus:ring-none focus:ring-none"
          rows={4}
          placeholder="Write a new note..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
        />
        {/* <button
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={addNote}
        >
          Add Note
        </button> */}
      </div>
      <div className="space-y-4">
        {notes.map((note) => (
          <div
            key={note.id}
            className="p-4 bg-black border  rounded-lg shadow-md w-full relative"
          >
            <p className="text-white">{note.content}</p>
            <button
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              onClick={() => deleteNote(note.id)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}