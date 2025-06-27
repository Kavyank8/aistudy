
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { FileText, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const flashcardSets = [
  { id: 1, title: "Biology Chapter 1", cards: 24, lastStudied: "2 days ago" },
  { id: 2, title: "Chemistry Formulas", cards: 36, lastStudied: "Yesterday" },
  { id: 3, title: "History Key Dates", cards: 18, lastStudied: "5 days ago" },
  { id: 4, title: "Programming Concepts", cards: 42, lastStudied: "1 week ago" },
  { id: 5, title: "Spanish Vocabulary", cards: 50, lastStudied: "3 days ago" },
];

const mockCards = [
  { 
    front: "What are the key factors influencing global food security, and how do they interconnect?", 
    back: "Global food security is influenced by climate change, population growth, agricultural practices, economic inequality, and international trade policies. These factors create a complex web of relationships affecting food production, distribution, and accessibility worldwide."
  },
  { 
    front: "Analyze the relationship between environmental sustainability and economic growth in developing nations.", 
    back: "The relationship is complex, involving trade-offs between immediate economic needs and long-term environmental preservation. Sustainable development practices, renewable energy adoption, and green technologies can create new economic opportunities while protecting natural resources, though implementation challenges exist."
  },
  { 
    front: "Explain the impact of technological advancement on modern education systems and how it has transformed traditional learning methods.", 
    back: "Technological advancement has revolutionized education through digital learning platforms, interactive content, personalized learning paths, and increased accessibility. This has led to blended learning approaches, improved student engagement, and the development of new pedagogical methods that combine traditional and digital tools."
  },
];

const Flashcards = () => {
  const [currentSetId, setCurrentSetId] = useState<number | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [currentCards, setCurrentCards] = useState(mockCards);

  const savedFlashcards = JSON.parse(localStorage.getItem('studygenius_flashcards') || '[]');
  const allFlashcards = [...flashcardSets, ...savedFlashcards];

  const handleSelectSet = (id: number) => {
    setCurrentSetId(id);
    setCurrentCardIndex(0);
    setFlipped(false);
    
    const selectedSet = allFlashcards.find(set => set.id === id);
    if (selectedSet && selectedSet.flashcards && selectedSet.flashcards.length > 0) {
      setCurrentCards(selectedSet.flashcards);
    } else {
      setCurrentCards(mockCards);
    }
  };

  const handleNextCard = () => {
    setFlipped(false);
    setCurrentCardIndex((prev) => (prev + 1) % currentCards.length);
  };

  const handlePrevCard = () => {
    setFlipped(false);
    setCurrentCardIndex((prev) => (prev - 1 + currentCards.length) % currentCards.length);
  };

  const deleteFlashcardSet = (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    
    // Check if it's a default flashcard set
    const isDefaultSet = flashcardSets.some(set => set.id === id);
    if (isDefaultSet) {
      toast({
        title: "Cannot Delete Default Flashcards",
        description: "Default flashcard sets cannot be deleted.",
        variant: "destructive"
      });
      return;
    }
    
    // Get saved flashcards from localStorage
    const savedFlashcards = JSON.parse(localStorage.getItem('studygenius_flashcards') || '[]');
    
    // Filter out the flashcard set to delete
    const updatedFlashcards = savedFlashcards.filter(set => set.id !== id);
    
    // Save the updated flashcards back to localStorage
    localStorage.setItem('studygenius_flashcards', JSON.stringify(updatedFlashcards));
    
    // Update the UI state
    const currentFlashcardSets = parseInt(localStorage.getItem('studygenius_flashcardSets') || '0');
    if (currentFlashcardSets > 0) {
      localStorage.setItem('studygenius_flashcardSets', (currentFlashcardSets - 1).toString());
    }
    
    // Show success toast
    toast({
      title: "Flashcard Set Deleted",
      description: "The flashcard set has been successfully deleted."
    });
    
    // Refresh UI
    window.dispatchEvent(new Event('studygenius_stats_updated'));
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        {currentSetId === null ? (
          <>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">My Flashcards</h1>
              <button className="flex items-center gap-2 bg-studygenius-teal text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors">
                <Plus className="h-5 w-5" />
                <span>Create Flashcards</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allFlashcards.map((set) => (
                <div 
                  key={set.id}
                  className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow dark:bg-gray-800 dark:border dark:border-gray-700 relative"
                  onClick={() => handleSelectSet(set.id)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <FileText className="h-8 w-8 text-studygenius-teal" />
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{set.cards} cards</span>
                      
                      {!flashcardSets.some(fs => fs.id === set.id) && (
                        <button 
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          onClick={(e) => deleteFlashcardSet(set.id, e)}
                          aria-label="Delete flashcard set"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 dark:text-white">{set.title}</h3>
                  <p className="text-gray-500 text-sm dark:text-gray-400">Last studied: {set.lastStudied}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div>
            <button 
              className="flex items-center gap-1 text-gray-600 mb-6 hover:text-studygenius-teal dark:text-gray-300 dark:hover:text-teal-400"
              onClick={() => setCurrentSetId(null)}
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Back to all flashcards</span>
            </button>

            <h1 className="text-2xl font-bold mb-6 dark:text-white">
              {allFlashcards.find(set => set.id === currentSetId)?.title || "Flashcards"}
            </h1>

            <div className="flex justify-center mb-8">
              <div 
                className="w-full max-w-lg aspect-video relative"
                onClick={() => setFlipped(!flipped)}
              >
                <div 
                  className={`absolute inset-0 backface-hidden transition-transform duration-500 transform 
                    ${flipped ? 'opacity-0 pointer-events-none rotate-y-180' : ''}`}
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="h-full bg-white dark:bg-gray-800 dark:text-white rounded-lg shadow-md flex items-center justify-center p-8 cursor-pointer">
                    <p className="text-xl text-center">{currentCards[currentCardIndex].front}</p>
                  </div>
                </div>
                <div 
                  className={`absolute inset-0 backface-hidden transition-transform duration-500 transform
                    ${flipped ? '' : 'opacity-0 pointer-events-none rotate-y-180'}`}
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="h-full bg-studygenius-teal text-white rounded-lg shadow-md flex items-center justify-center p-8 cursor-pointer">
                    <p className="text-xl text-center">{currentCards[currentCardIndex].back}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center items-center gap-6">
              <button 
                className="p-2 bg-gray-100 dark:bg-gray-700 dark:text-gray-200 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                onClick={handlePrevCard}
              >
                <ChevronLeft className="h-6 w-6 text-gray-700 dark:text-gray-200" />
              </button>
              <span className="text-gray-600 dark:text-gray-300">
                {currentCardIndex + 1} / {currentCards.length}
              </span>
              <button 
                className="p-2 bg-gray-100 dark:bg-gray-700 dark:text-gray-200 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                onClick={handleNextCard}
              >
                <ChevronRight className="h-6 w-6 text-gray-700 dark:text-gray-200" />
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Flashcards;
