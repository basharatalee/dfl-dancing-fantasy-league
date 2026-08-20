'use client';

import { useState } from 'react';
import { useAdminGuard } from '@/hooks/useAdminGuard';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScoringRules } from '@/lib/types';
import { DEFAULT_SCORING_RULES } from '@/lib/scoring-engine';
import { Settings, Save } from 'lucide-react';

export default function SettingsPage() {
  const { isAdmin, isLoading } = useAdminGuard();
  const [scoringRules, setScoringRules] = useState<ScoringRules>(DEFAULT_SCORING_RULES);
  const [changes, setChanges] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const handleRuleChange = (rule: keyof ScoringRules, value: number) => {
    setScoringRules({ ...scoringRules, [rule]: value });
    setChanges(true);
  };

  const handleSaveRules = async () => {
    // TODO: Call API endpoint
    // await fetch('/api/admin/scoring-rules', {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(scoringRules),
    // });

    setChanges(false);
    alert('Scoring rules updated!');
  };

  const resetToDefaults = () => {
    setScoringRules(DEFAULT_SCORING_RULES);
    setChanges(true);
  };

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <Settings className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-serif font-bold text-foreground">Settings</h1>
              <p className="text-muted-foreground mt-1">Configure scoring rules and system settings</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Scoring Rules */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-foreground mb-6">Scoring Rules</h2>

                <div className="space-y-6">
                  {/* Season Scoring */}
                  <div className="pb-6 border-b border-border">
                    <h3 className="font-semibold text-foreground mb-4 text-sm">Season-Long Predictions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">Base Points</label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={scoringRules.seasonBase}
                            onChange={(e) => handleRuleChange('seasonBase', parseInt(e.target.value) || 0)}
                            className="flex-1"
                          />
                          <span className="text-sm text-muted-foreground">pts</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Correct placement</p>
                      </div>
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">Bonus Points</label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={scoringRules.seasonBonus}
                            onChange={(e) => handleRuleChange('seasonBonus', parseInt(e.target.value) || 0)}
                            className="flex-1"
                          />
                          <span className="text-sm text-muted-foreground">pts</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Finalist bonus</p>
                      </div>
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">Penalty</label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={scoringRules.seasonPenalty}
                            onChange={(e) => handleRuleChange('seasonPenalty', parseInt(e.target.value) || 0)}
                            className="flex-1"
                          />
                          <span className="text-sm text-muted-foreground">pts</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Misprediction penalty</p>
                      </div>
                    </div>
                  </div>

                  {/* Weekly Scoring */}
                  <div className="pb-6 border-b border-border">
                    <h3 className="font-semibold text-foreground mb-4 text-sm">Weekly Predictions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">Base Points</label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={scoringRules.weeklyBase}
                            onChange={(e) => handleRuleChange('weeklyBase', parseInt(e.target.value) || 0)}
                            className="flex-1"
                          />
                          <span className="text-sm text-muted-foreground">pts</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Correct placement</p>
                      </div>
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">Bonus Points</label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={scoringRules.weeklyBonus}
                            onChange={(e) => handleRuleChange('weeklyBonus', parseInt(e.target.value) || 0)}
                            className="flex-1"
                          />
                          <span className="text-sm text-muted-foreground">pts</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Top 3 bonus</p>
                      </div>
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">Penalty</label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={scoringRules.weeklyPenalty}
                            onChange={(e) => handleRuleChange('weeklyPenalty', parseInt(e.target.value) || 0)}
                            className="flex-1"
                          />
                          <span className="text-sm text-muted-foreground">pts</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Bottom 3 penalty</p>
                      </div>
                    </div>
                  </div>

                  {/* Special Bonuses */}
                  <div>
                    <h3 className="font-semibold text-foreground mb-4 text-sm">Special Bonuses</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">Elimination Bonus</label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={scoringRules.eliminationBonus}
                            onChange={(e) => handleRuleChange('eliminationBonus', parseInt(e.target.value) || 0)}
                            className="flex-1"
                          />
                          <span className="text-sm text-muted-foreground">pts</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Per elimination</p>
                      </div>
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">Survival Bonus</label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={scoringRules.draftSurvivalBonus}
                            onChange={(e) => handleRuleChange('draftSurvivalBonus', parseInt(e.target.value) || 0)}
                            className="flex-1"
                          />
                          <span className="text-sm text-muted-foreground">pts/wk</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Per week survived</p>
                      </div>
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">Finalist Multiplier</label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={scoringRules.finalistBonusMultiplier}
                            onChange={(e) => handleRuleChange('finalistBonusMultiplier', parseFloat(e.target.value) || 1)}
                            className="flex-1"
                            step="0.1"
                          />
                          <span className="text-sm text-muted-foreground">x</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Score multiplier</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 pt-6 border-t border-border flex gap-3">
                  <Button
                    onClick={handleSaveRules}
                    disabled={!changes}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Rules
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetToDefaults}
                  >
                    Reset to Defaults
                  </Button>
                </div>
              </Card>
            </div>

            {/* Reference Panel */}
            <div className="space-y-4">
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Current Values</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Season Base</span>
                    <span className="font-medium text-foreground">+{scoringRules.seasonBase}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Season Bonus</span>
                    <span className="font-medium text-foreground">+{scoringRules.seasonBonus}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Weekly Base</span>
                    <span className="font-medium text-foreground">+{scoringRules.weeklyBase}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Weekly Bonus</span>
                    <span className="font-medium text-foreground">+{scoringRules.weeklyBonus}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Elimination</span>
                    <span className="font-medium text-foreground">+{scoringRules.eliminationBonus}</span>
                  </div>
                </div>
              </Card>

              {changes && (
                <Card className="p-4 bg-primary/10 border border-primary/30">
                  <p className="text-sm text-foreground font-medium">Unsaved Changes</p>
                  <p className="text-xs text-muted-foreground mt-1">Don&apos;t forget to save your changes</p>
                </Card>
              )}

              <Card className="p-4 bg-secondary/10 border border-secondary/30">
                <p className="text-xs font-semibold text-foreground mb-2">Scoring Examples</p>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p>✓ Correct placement: +{scoringRules.weeklyBase}</p>
                  <p>✓ Top 3 correct: +{scoringRules.weeklyBonus}</p>
                  <p>✗ Bottom 3 wrong: -{scoringRules.weeklyPenalty}</p>
                  <p>✓ Predicted elimination: +{scoringRules.eliminationBonus}</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
