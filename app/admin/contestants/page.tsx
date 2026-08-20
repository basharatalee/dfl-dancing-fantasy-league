'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CONTESTANTS } from '@/lib/mock-data';
import { Contestant } from '@/lib/types';
import { Trash2, Edit2, Plus, Check, X } from 'lucide-react';

export default function ContestantsAdmin() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [contestants, setContestants] = useState<Contestant[]>(CONTESTANTS);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [newContestantName, setNewContestantName] = useState('');

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  const handleEdit = (id: number, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const handleSaveEdit = (id: number) => {
    setContestants(
      contestants.map(c => c.id === id ? { ...c, name: editName } : c)
    );
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleDelete = (id: number) => {
    setContestants(contestants.filter(c => c.id !== id));
  };

  const handleMarkEliminated = (id: number) => {
    setContestants(
      contestants.map(c => c.id === id ? { ...c, eliminated: true, status: 'eliminated' } : c)
    );
  };

  const handleAddContestant = () => {
    if (!newContestantName.trim()) return;
    
    const newId = Math.max(...contestants.map(c => c.id), 0) + 1;
    const newContestant: Contestant = {
      id: newId,
      name: newContestantName,
      status: 'active',
      eliminated: false,
      order: contestants.length + 1,
    };
    
    setContestants([...contestants, newContestant]);
    setNewContestantName('');
  };

  const activeCount = contestants.filter(c => !c.eliminated).length;
  const eliminatedCount = contestants.filter(c => c.eliminated).length;

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      
      <main className="flex-1 overflow-y-auto">
        <Header />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-serif font-bold text-foreground mb-2">Contestant Management</h1>
            <p className="text-muted-foreground">Manage dancer pairs and eliminations</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="p-6 border-border/50">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{contestants.length}</div>
                <div className="text-sm text-muted-foreground mt-1">Total Contestants</div>
              </div>
            </Card>
            <Card className="p-6 border-border/50">
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary">{activeCount}</div>
                <div className="text-sm text-muted-foreground mt-1">Still Competing</div>
              </div>
            </Card>
            <Card className="p-6 border-border/50">
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">{eliminatedCount}</div>
                <div className="text-sm text-muted-foreground mt-1">Eliminated</div>
              </div>
            </Card>
          </div>

          {/* Add New Contestant */}
          <Card className="mb-8 p-6 border-border/50">
            <h3 className="text-lg font-semibold text-foreground mb-4">Add New Contestant</h3>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Dancer name & partner"
                value={newContestantName}
                onChange={(e) => setNewContestantName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddContestant()}
                className="flex-1"
              />
              <Button onClick={handleAddContestant} className="gap-2">
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </div>
          </Card>

          {/* Contestants Table */}
          <Card className="border-border/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Order</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Dancer Pair</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contestants.map((contestant) => (
                    <tr key={contestant.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 text-sm text-foreground font-medium">{contestant.order}</td>
                      <td className="px-6 py-4 text-sm">
                        {editingId === contestant.id ? (
                          <Input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="max-w-xs"
                          />
                        ) : (
                          <span className="text-foreground">{contestant.name}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            contestant.eliminated
                              ? 'bg-destructive/10 text-destructive'
                              : 'bg-secondary/10 text-secondary'
                          }`}
                        >
                          {contestant.eliminated ? 'Eliminated' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right space-x-2">
                        {editingId === contestant.id ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSaveEdit(contestant.id)}
                              className="gap-1"
                            >
                              <Check className="w-4 h-4" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancel}
                              className="gap-1"
                            >
                              <X className="w-4 h-4" />
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(contestant.id, contestant.name)}
                              className="gap-1"
                            >
                              <Edit2 className="w-4 h-4" />
                              Edit
                            </Button>
                            {!contestant.eliminated && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMarkEliminated(contestant.id)}
                                className="gap-1 text-accent"
                              >
                                Eliminate
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(contestant.id)}
                              className="gap-1 text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <Footer />
      </main>
    </div>
  );
}
