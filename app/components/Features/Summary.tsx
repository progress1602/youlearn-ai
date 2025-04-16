import React from 'react';

export const Summary: React.FC = () => {
  return (
    <div className="p-4 flex-1 overflow-y-auto mx-auto max-w-3xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <p className="text-md font-bold">Summary</p>
      <div className="text-sm mt-2">
        <div className="hover:bg-[#525252] p-4 rounded-lg">
          <p className="mt-1">
            The strength of an acid is determined by the concentration of hydronium ions it produces, which is measured using pH—a scale where lower values indicate acidity and higher values indicate basicity. The pH scale and the pOH scale, which measures hydroxide ions, always add up to 14. In reactions between strong acids and bases, they neutralize each other to form water and salt, involving oxidation-reduction processes where the oxidation states of elements change.
            Electrons within an atom are described by four quantum numbers (n, l, ml, and ms) that define their shells, subshells, and orbitals, providing a probabilistic model of their locations. The electron configuration follows a specific filling order known as the Aufbau principle, with each subshell accommodating a set number of electrons, influenced by their quantum numbers. This structure allows for determining valence electrons by focusing on the subshells beyond the nearest noble gas configuration.ConcurrentModificationException
          </p>
        </div>
      </div>
    </div>
  );
};